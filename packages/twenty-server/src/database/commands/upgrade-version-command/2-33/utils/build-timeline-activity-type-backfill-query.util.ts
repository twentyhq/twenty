import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type TimelineActivityAction } from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

import {
  buildTimelineActivityTypeResolver,
  type TimelineActivityTypeResolutionMaps,
} from 'src/modules/timeline/utils/resolve-timeline-activity-type-id.util';

// The legacy name held `<object>.<databaseAction>` for a record's own events and
// `linked-<object>.<databaseAction>` for events about a linked record. A junction
// row being created or restored is a link, deleted is an unlink, and updated is
// the linked record itself changing, which is why the two halves differ.
const LINKED_ACTION_BY_DATABASE_ACTION: Record<string, TimelineActivityAction> =
  {
    created: 'linked',
    restored: 'linked',
    updated: 'updated',
    deleted: 'unlinked',
  };

const SELF_ACTION_BY_DATABASE_ACTION: Record<string, TimelineActivityAction> = {
  created: 'created',
  updated: 'updated',
  deleted: 'deleted',
  restored: 'restored',
};

// Notes and tasks were written through the junction path, messages and calendar
// events through their own listeners, which is why only the first two carry the
// `linked-` prefix.
const LEGACY_JUNCTION_OBJECTS = [
  { legacyName: 'note', universalIdentifier: STANDARD_OBJECTS.note.universalIdentifier },
  { legacyName: 'task', universalIdentifier: STANDARD_OBJECTS.task.universalIdentifier },
] as const;

const LEGACY_PARTICIPANT_NAMES = [
  {
    legacyName: 'message.linked',
    universalIdentifier: STANDARD_OBJECTS.message.universalIdentifier,
  },
  {
    legacyName: 'calendarEvent.linked',
    universalIdentifier: STANDARD_OBJECTS.calendarEvent.universalIdentifier,
  },
] as const;

// Bounded so each batch is a short transaction: timelineActivity is one of the
// largest tables in a workspace and a single unbounded UPDATE would hold row
// locks and grow WAL for the whole rewrite.
export const buildTimelineActivityTypeBackfillQuery = ({
  schemaName,
  flatTimelineActivityTypeMaps,
  batchSize,
}: {
  schemaName: string;
  flatTimelineActivityTypeMaps: TimelineActivityTypeResolutionMaps;
  batchSize: number;
}):
  | {
      sql: string;
      parameters: string[];
    }
  | undefined => {
  const resolveTimelineActivityTypeId = buildTimelineActivityTypeResolver(
    flatTimelineActivityTypeMaps,
  );

  const fallbackTypeId = resolveTimelineActivityTypeId({ action: 'linked' });

  if (!isDefined(fallbackTypeId)) {
    return undefined;
  }

  const parameters: string[] = [];
  const whenClauses: string[] = [];

  const pushWhenClause = (
    condition: string,
    typeId: string | undefined,
  ): void => {
    if (!isDefined(typeId)) {
      return;
    }

    parameters.push(typeId);
    whenClauses.push(`WHEN ${condition} THEN $${parameters.length}::uuid`);
  };

  // The object-bound arms come first so a linked note keeps its own type rather
  // than matching the shared arm for the same action.
  for (const { legacyName, universalIdentifier } of LEGACY_PARTICIPANT_NAMES) {
    pushWhenClause(
      `"name" = '${legacyName}'`,
      resolveTimelineActivityTypeId({
        action: 'linked',
        objectUniversalIdentifier: universalIdentifier,
      }),
    );
  }

  for (const { legacyName, universalIdentifier } of LEGACY_JUNCTION_OBJECTS) {
    for (const [databaseAction, action] of Object.entries(
      LINKED_ACTION_BY_DATABASE_ACTION,
    )) {
      if (databaseAction === 'updated') {
        const legacyUpdatedName = `linked-${legacyName}.updated`;

        // Source-record updates and junction repoints shared this legacy name.
        // A source update carries the field diff; a junction event does not.
        pushWhenClause(
          `"name" = '${legacyUpdatedName}' AND jsonb_typeof("properties"->'diff') = 'object' AND "properties"->'diff' <> '{}'::jsonb`,
          resolveTimelineActivityTypeId({
            action,
            objectUniversalIdentifier: universalIdentifier,
          }),
        );
        pushWhenClause(
          `"name" = '${legacyUpdatedName}'`,
          resolveTimelineActivityTypeId({
            action: 'linked',
            objectUniversalIdentifier: universalIdentifier,
          }),
        );

        continue;
      }

      pushWhenClause(
        `"name" = 'linked-${legacyName}.${databaseAction}'`,
        resolveTimelineActivityTypeId({
          action,
          objectUniversalIdentifier: universalIdentifier,
        }),
      );
    }
  }

  for (const [databaseAction, action] of Object.entries(
    LINKED_ACTION_BY_DATABASE_ACTION,
  )) {
    pushWhenClause(
      `"name" LIKE 'linked-%' AND split_part("name", '.', 2) = '${databaseAction}'`,
      resolveTimelineActivityTypeId({ action }),
    );
  }

  for (const [databaseAction, action] of Object.entries(
    SELF_ACTION_BY_DATABASE_ACTION,
  )) {
    pushWhenClause(
      `"name" NOT LIKE 'linked-%' AND split_part("name", '.', 2) = '${databaseAction}'`,
      resolveTimelineActivityTypeId({ action }),
    );
  }

  parameters.push(fallbackTypeId);

  return {
    sql: `UPDATE "${schemaName}"."timelineActivity" SET "timelineActivityTypeId" = CASE ${whenClauses.join(' ')} ELSE $${parameters.length}::uuid END WHERE "id" IN (SELECT "id" FROM "${schemaName}"."timelineActivity" WHERE "timelineActivityTypeId" IS NULL LIMIT ${batchSize})`,
    parameters,
  };
};
