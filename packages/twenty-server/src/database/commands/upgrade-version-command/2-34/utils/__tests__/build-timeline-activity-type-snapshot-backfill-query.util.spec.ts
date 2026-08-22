import { buildTimelineActivityTypeSnapshotBackfillQuery } from 'src/database/commands/upgrade-version-command/2-34/utils/build-timeline-activity-type-snapshot-backfill-query.util';

describe('buildTimelineActivityTypeSnapshotBackfillQuery', () => {
  it('builds a bounded snapshot backfill for the requested workspace schema', () => {
    const query = buildTimelineActivityTypeSnapshotBackfillQuery({
      schemaName: 'workspace_00000000000040008000000000000001',
      batchSize: 5000,
    });

    expect(query).toContain(
      'FROM "workspace_00000000000040008000000000000001"."timelineActivity" timeline_activity',
    );
    expect(query).toContain(
      'WHERE timeline_activity."timelineActivityTypeSnapshot" IS NULL',
    );
    expect(query).toContain('LIMIT 5000');
    expect(query).toContain(
      `'frontComponentUniversalIdentifier', rows_to_update."frontComponentUniversalIdentifier"`,
    );
    expect(query).not.toContain(`'renderer'`);
  });
});
