import { type QueryRunner } from 'typeorm';

import { EnforceTimelineActivityTypeEmitUniquenessFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-34/2-34-instance-command-fast-1787471608316-enforce-timeline-activity-type-emit-uniqueness';

describe('EnforceTimelineActivityTypeEmitUniquenessFastInstanceCommand', () => {
  const query = jest.fn();
  const queryRunner = { query } as unknown as QueryRunner;
  const command =
    new EnforceTimelineActivityTypeEmitUniquenessFastInstanceCommand();

  beforeEach(() => {
    query.mockReset();
  });

  it('allows one base and one override per emit slot', async () => {
    await command.up(queryRunner);

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0]).toContain(
      'IDX_TIMELINE_ACTIVITY_TYPE_BASE_EMIT_SLOT_UNIQUE',
    );
    expect(query.mock.calls[0][0]).toContain('NULLS NOT DISTINCT');
    expect(query.mock.calls[0][0]).toContain(
      '"replacesTimelineActivityTypeUniversalIdentifier" IS NULL',
    );
    expect(query.mock.calls[1][0]).toContain(
      'IDX_TIMELINE_ACTIVITY_TYPE_OVERRIDE_EMIT_SLOT_UNIQUE',
    );
    expect(query.mock.calls[1][0]).toContain(
      '"replacesTimelineActivityTypeUniversalIdentifier" IS NOT NULL',
    );
  });

  it('drops both emit-slot indexes on rollback', async () => {
    await command.down(queryRunner);

    expect(query).toHaveBeenNthCalledWith(
      1,
      'DROP INDEX "core"."IDX_TIMELINE_ACTIVITY_TYPE_OVERRIDE_EMIT_SLOT_UNIQUE"',
    );
    expect(query).toHaveBeenNthCalledWith(
      2,
      'DROP INDEX "core"."IDX_TIMELINE_ACTIVITY_TYPE_BASE_EMIT_SLOT_UNIQUE"',
    );
  });
});
