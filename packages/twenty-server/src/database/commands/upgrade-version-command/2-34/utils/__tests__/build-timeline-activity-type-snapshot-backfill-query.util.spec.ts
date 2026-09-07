import { buildTimelineActivityTypeSnapshotBackfillQuery } from 'src/database/commands/upgrade-version-command/2-34/utils/build-timeline-activity-type-snapshot-backfill-query.util';

describe('buildTimelineActivityTypeSnapshotBackfillQuery', () => {
  it('builds a bounded snapshot backfill for the requested workspace schema', () => {
    const query = buildTimelineActivityTypeSnapshotBackfillQuery({
      schemaName: 'workspace_00000000000040008000000000000001',
      batchSize: 5000,
      afterTimelineActivityId: null,
    });

    expect(query.sql).toContain(
      'FROM "workspace_00000000000040008000000000000001"."timelineActivity" timeline_activity',
    );
    expect(query.sql).toContain(
      'WHERE timeline_activity."timelineActivityTypeSnapshot" IS NULL',
    );
    expect(query.sql).toContain(
      'timeline_activity."id" > $1::uuid',
    );
    expect(query.sql).toContain('ORDER BY timeline_activity."id"');
    expect(query.sql).toContain('LIMIT $2');
    expect(query.sql).toContain('RETURNING timeline_activity."id"');
    expect(query.sql).toContain(
      `'frontComponentUniversalIdentifier', rows_to_update."frontComponentUniversalIdentifier"`,
    );
    expect(query.sql).not.toContain(`'renderer'`);
    expect(query.parameters).toEqual([null, 5000]);
  });
});
