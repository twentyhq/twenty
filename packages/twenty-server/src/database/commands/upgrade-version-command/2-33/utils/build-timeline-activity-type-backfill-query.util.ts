import { type TimelineActivityAction } from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { buildTimelineActivityTypeIdByAction } from 'src/modules/timeline/utils/build-timeline-activity-type-id-by-action.util';

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

export const buildTimelineActivityTypeBackfillQuery = ({
  schemaName,
  flatTimelineActivityTypeMaps,
}: {
  schemaName: string;
  flatTimelineActivityTypeMaps: FlatEntityMaps<FlatTimelineActivityType>;
}):
  | {
      sql: string;
      parameters: string[];
    }
  | undefined => {
  const timelineActivityTypeIdByAction = buildTimelineActivityTypeIdByAction(
    flatTimelineActivityTypeMaps,
  );

  const fallbackTypeId = timelineActivityTypeIdByAction.linked;

  if (!isDefined(fallbackTypeId)) {
    return undefined;
  }

  const parameters: string[] = [];
  const whenClauses: string[] = [];

  const pushWhenClause = (condition: string, action: TimelineActivityAction) => {
    const typeId = timelineActivityTypeIdByAction[action];

    if (!isDefined(typeId)) {
      return;
    }

    parameters.push(typeId);
    whenClauses.push(`WHEN ${condition} THEN $${parameters.length}::uuid`);
  };

  for (const [databaseAction, action] of Object.entries(
    LINKED_ACTION_BY_DATABASE_ACTION,
  )) {
    pushWhenClause(
      `"name" LIKE 'linked-%' AND split_part("name", '.', 2) = '${databaseAction}'`,
      action,
    );
  }

  for (const [databaseAction, action] of Object.entries(
    SELF_ACTION_BY_DATABASE_ACTION,
  )) {
    pushWhenClause(
      `"name" NOT LIKE 'linked-%' AND split_part("name", '.', 2) = '${databaseAction}'`,
      action,
    );
  }

  parameters.push(fallbackTypeId);

  return {
    sql: `UPDATE "${schemaName}"."timelineActivity" SET "timelineActivityTypeId" = CASE ${whenClauses.join(' ')} ELSE $${parameters.length}::uuid END WHERE "timelineActivityTypeId" IS NULL`,
    parameters,
  };
};
