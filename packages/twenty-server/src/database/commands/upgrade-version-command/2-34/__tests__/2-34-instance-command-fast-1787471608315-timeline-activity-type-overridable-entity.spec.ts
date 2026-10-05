import { type QueryRunner } from 'typeorm';

import { TimelineActivityTypeOverridableEntityFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-34/2-34-instance-command-fast-1787471608315-timeline-activity-type-overridable-entity';

describe('TimelineActivityTypeOverridableEntityFastInstanceCommand', () => {
  const query = jest.fn();
  const queryRunner = { query } as unknown as QueryRunner;
  const command = new TimelineActivityTypeOverridableEntityFastInstanceCommand();

  beforeEach(() => {
    query.mockReset();
  });

  it('adds workspace override and active-state columns', async () => {
    await command.up(queryRunner);

    expect(query).toHaveBeenCalledWith(
      'ALTER TABLE "core"."timelineActivityType" ADD "overrides" jsonb, ADD "isActive" boolean NOT NULL DEFAULT true',
    );
  });

  it('removes workspace override and active-state columns', async () => {
    await command.down(queryRunner);

    expect(query).toHaveBeenCalledWith(
      'ALTER TABLE "core"."timelineActivityType" DROP COLUMN "isActive", DROP COLUMN "overrides"',
    );
  });
});
