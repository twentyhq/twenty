import { buildTimelineActivityTypeBackfillQuery } from 'src/database/commands/upgrade-version-command/2-33/utils/build-timeline-activity-type-backfill-query.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type TimelineActivityTypeResolutionMaps } from 'src/modules/timeline/utils/resolve-timeline-activity-type-id.util';

const TYPE_ID_BY_ACTION = {
  created: '00000000-0000-4000-8000-000000000001',
  updated: '00000000-0000-4000-8000-000000000002',
  deleted: '00000000-0000-4000-8000-000000000003',
  restored: '00000000-0000-4000-8000-000000000004',
  linked: '00000000-0000-4000-8000-000000000005',
  unlinked: '00000000-0000-4000-8000-000000000006',
};

const buildFlatTimelineActivityTypeMaps = (
  actions: (keyof typeof TYPE_ID_BY_ACTION)[],
): TimelineActivityTypeResolutionMaps => ({
  byUniversalIdentifier: Object.fromEntries(
    actions.map((action) => [
      action,
      {
        id: TYPE_ID_BY_ACTION[action],
        action,
        objectUniversalIdentifier: null,
      },
    ]),
  ),
});

// The same type id can back several arms, so an arm is checked through the
// placeholder it actually carries rather than the first matching parameter.
const getTypeIdForCondition = (
  query: { sql: string; parameters: string[] },
  condition: string,
): string | undefined => {
  const placeholder = query.sql.match(
    new RegExp(`WHEN ${condition.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} THEN \\$(\\d+)::uuid`),
  );

  return isDefined(placeholder)
    ? query.parameters[Number(placeholder[1]) - 1]
    : undefined;
};

const NOTE_LINKED_TYPE_ID = '00000000-0000-4000-8000-00000000000a';
const MESSAGE_LINKED_TYPE_ID = '00000000-0000-4000-8000-00000000000b';
const NOTE_UPDATED_TYPE_ID = '00000000-0000-4000-8000-00000000000c';

const buildFlatTimelineActivityTypeMapsWithObjectBoundTypes =
  (): TimelineActivityTypeResolutionMaps => ({
    byUniversalIdentifier: {
      ...buildFlatTimelineActivityTypeMaps(
        Object.keys(TYPE_ID_BY_ACTION) as (keyof typeof TYPE_ID_BY_ACTION)[],
      ).byUniversalIdentifier,
      noteLinked: {
        id: NOTE_LINKED_TYPE_ID,
        action: 'linked',
        objectUniversalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
      },
      noteUpdated: {
        id: NOTE_UPDATED_TYPE_ID,
        action: 'updated',
        objectUniversalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
      },
      messageLinked: {
        id: MESSAGE_LINKED_TYPE_ID,
        action: 'linked',
        objectUniversalIdentifier: STANDARD_OBJECTS.message.universalIdentifier,
      },
    },
  });

describe('buildTimelineActivityTypeBackfillQuery', () => {
  it('returns undefined when the fallback linked type is missing', () => {
    expect(
      buildTimelineActivityTypeBackfillQuery({
        schemaName: 'workspace_1',
        batchSize: 5000,
        flatTimelineActivityTypeMaps: buildFlatTimelineActivityTypeMaps([
          'created',
        ]),
      }),
    ).toBeUndefined();
  });

  it('maps a deleted junction row to unlinked and a deleted record to deleted', () => {
    const query = buildTimelineActivityTypeBackfillQuery({
      schemaName: 'workspace_1',
      batchSize: 5000,
      flatTimelineActivityTypeMaps: buildFlatTimelineActivityTypeMaps(
        Object.keys(TYPE_ID_BY_ACTION) as (keyof typeof TYPE_ID_BY_ACTION)[],
      ),
    });

    expect(query).toBeDefined();

    expect(
      getTypeIdForCondition(
        query!,
        `"name" LIKE 'linked-%' AND split_part("name", '.', 2) = 'deleted'`,
      ),
    ).toBe(TYPE_ID_BY_ACTION.unlinked);
    expect(
      getTypeIdForCondition(
        query!,
        `"name" NOT LIKE 'linked-%' AND split_part("name", '.', 2) = 'deleted'`,
      ),
    ).toBe(TYPE_ID_BY_ACTION.deleted);
  });

  it('falls back to linked for names it cannot parse and only touches unset rows', () => {
    const query = buildTimelineActivityTypeBackfillQuery({
      schemaName: 'workspace_1',
      batchSize: 5000,
      flatTimelineActivityTypeMaps: buildFlatTimelineActivityTypeMaps(
        Object.keys(TYPE_ID_BY_ACTION) as (keyof typeof TYPE_ID_BY_ACTION)[],
      ),
    });

    expect(query!.parameters[query!.parameters.length - 1]).toBe(
      TYPE_ID_BY_ACTION.linked,
    );
    expect(query!.sql).toContain(
      `ELSE $${query!.parameters.length}::uuid END WHERE "id" IN (SELECT "id" FROM "workspace_1"."timelineActivity" WHERE "timelineActivityTypeId" IS NULL LIMIT 5000)`,
    );
    expect(query!.sql).toContain('UPDATE "workspace_1"."timelineActivity"');
  });

  it('stamps a linked note with the note type rather than the shared linked type', () => {
    const query = buildTimelineActivityTypeBackfillQuery({
      schemaName: 'workspace_1',
      batchSize: 5000,
      flatTimelineActivityTypeMaps:
        buildFlatTimelineActivityTypeMapsWithObjectBoundTypes(),
    });

    expect(
      getTypeIdForCondition(query!, `"name" = 'linked-note.created'`),
    ).toBe(NOTE_LINKED_TYPE_ID);
  });

  it('distinguishes a linked record update from a junction repoint by its diff', () => {
    const query = buildTimelineActivityTypeBackfillQuery({
      schemaName: 'workspace_1',
      batchSize: 5000,
      flatTimelineActivityTypeMaps:
        buildFlatTimelineActivityTypeMapsWithObjectBoundTypes(),
    });

    expect(
      getTypeIdForCondition(
        query!,
        `"name" = 'linked-note.updated' AND jsonb_typeof("properties"->'diff') = 'object' AND "properties"->'diff' <> '{}'::jsonb`,
      ),
    ).toBe(NOTE_UPDATED_TYPE_ID);
    expect(
      getTypeIdForCondition(query!, `"name" = 'linked-note.updated'`),
    ).toBe(NOTE_LINKED_TYPE_ID);
  });

  it('stamps the participant-written message name with the message type', () => {
    const query = buildTimelineActivityTypeBackfillQuery({
      schemaName: 'workspace_1',
      batchSize: 5000,
      flatTimelineActivityTypeMaps:
        buildFlatTimelineActivityTypeMapsWithObjectBoundTypes(),
    });

    expect(getTypeIdForCondition(query!, `"name" = 'message.linked'`)).toBe(
      MESSAGE_LINKED_TYPE_ID,
    );
  });

  it('orders object-bound arms before the shared arm for the same action', () => {
    const query = buildTimelineActivityTypeBackfillQuery({
      schemaName: 'workspace_1',
      batchSize: 5000,
      flatTimelineActivityTypeMaps:
        buildFlatTimelineActivityTypeMapsWithObjectBoundTypes(),
    });

    expect(query!.sql.indexOf(`WHEN "name" = 'linked-note.created'`)).toBeLessThan(
      query!.sql.indexOf(`WHEN "name" LIKE 'linked-%'`),
    );
  });
});
