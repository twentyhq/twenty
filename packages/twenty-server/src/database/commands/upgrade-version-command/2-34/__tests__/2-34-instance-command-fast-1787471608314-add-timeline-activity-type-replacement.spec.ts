import { type QueryRunner } from 'typeorm';

import { AddTimelineActivityTypeReplacementFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-34/2-34-instance-command-fast-1787471608314-add-timeline-activity-type-replacement';

describe('AddTimelineActivityTypeReplacementFastInstanceCommand', () => {
  const query = jest.fn();
  const queryRunner = { query } as unknown as QueryRunner;
  const command = new AddTimelineActivityTypeReplacementFastInstanceCommand();

  beforeEach(() => {
    query.mockReset();
  });

  it('adds the explicit override reference', async () => {
    await command.up(queryRunner);

    expect(query).toHaveBeenCalledWith(
      'ALTER TABLE "core"."timelineActivityType" ADD "replacesTimelineActivityTypeUniversalIdentifier" uuid',
    );
  });

  it('drops the override reference on rollback', async () => {
    await command.down(queryRunner);

    expect(query).toHaveBeenCalledWith(
      'ALTER TABLE "core"."timelineActivityType" DROP COLUMN "replacesTimelineActivityTypeUniversalIdentifier"',
    );
  });
});
