import { buildTimelineActivityTypeBackfillQuery } from 'src/database/commands/upgrade-version-command/2-33/utils/build-timeline-activity-type-backfill-query.util';
import { type TimelineActivityTypeIdAndActionMaps } from 'src/modules/timeline/utils/build-timeline-activity-type-id-by-action.util';

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
): TimelineActivityTypeIdAndActionMaps => ({
  byUniversalIdentifier: Object.fromEntries(
    actions.map((action) => [action, { id: TYPE_ID_BY_ACTION[action], action }]),
  ),
});

describe('buildTimelineActivityTypeBackfillQuery', () => {
  it('returns undefined when the fallback linked type is missing', () => {
    expect(
      buildTimelineActivityTypeBackfillQuery({
        schemaName: 'workspace_1',
        flatTimelineActivityTypeMaps: buildFlatTimelineActivityTypeMaps([
          'created',
        ]),
      }),
    ).toBeUndefined();
  });

  it('maps a deleted junction row to unlinked and a deleted record to deleted', () => {
    const query = buildTimelineActivityTypeBackfillQuery({
      schemaName: 'workspace_1',
      flatTimelineActivityTypeMaps: buildFlatTimelineActivityTypeMaps(
        Object.keys(TYPE_ID_BY_ACTION) as (keyof typeof TYPE_ID_BY_ACTION)[],
      ),
    });

    expect(query).toBeDefined();

    const unlinkedParameterIndex =
      query!.parameters.indexOf(TYPE_ID_BY_ACTION.unlinked) + 1;
    const deletedParameterIndex =
      query!.parameters.indexOf(TYPE_ID_BY_ACTION.deleted) + 1;

    expect(query!.sql).toContain(
      `WHEN "name" LIKE 'linked-%' AND split_part("name", '.', 2) = 'deleted' THEN $${unlinkedParameterIndex}::uuid`,
    );
    expect(query!.sql).toContain(
      `WHEN "name" NOT LIKE 'linked-%' AND split_part("name", '.', 2) = 'deleted' THEN $${deletedParameterIndex}::uuid`,
    );
  });

  it('falls back to linked for names it cannot parse and only touches unset rows', () => {
    const query = buildTimelineActivityTypeBackfillQuery({
      schemaName: 'workspace_1',
      flatTimelineActivityTypeMaps: buildFlatTimelineActivityTypeMaps(
        Object.keys(TYPE_ID_BY_ACTION) as (keyof typeof TYPE_ID_BY_ACTION)[],
      ),
    });

    expect(query!.parameters[query!.parameters.length - 1]).toBe(
      TYPE_ID_BY_ACTION.linked,
    );
    expect(query!.sql).toContain(
      `ELSE $${query!.parameters.length}::uuid END WHERE "timelineActivityTypeId" IS NULL`,
    );
    expect(query!.sql).toContain('UPDATE "workspace_1"."timelineActivity"');
  });
});
