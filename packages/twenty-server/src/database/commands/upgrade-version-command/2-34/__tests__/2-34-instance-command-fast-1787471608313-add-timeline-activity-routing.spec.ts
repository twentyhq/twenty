import { type QueryRunner } from 'typeorm';

import { AddTimelineActivityRoutingFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-34/2-34-instance-command-fast-1787471608313-add-timeline-activity-routing';

describe('AddTimelineActivityRoutingFastInstanceCommand', () => {
  const query = jest.fn();
  const queryRunner = { query } as unknown as QueryRunner;
  const command = new AddTimelineActivityRoutingFastInstanceCommand();

  beforeEach(() => {
    query.mockReset();
  });

  it('adds the generic event-routing contract', async () => {
    await command.up(queryRunner);

    expect(query).toHaveBeenCalledWith(
      'ALTER TABLE "core"."timelineActivityType" ADD "targetRelationFieldUniversalIdentifier" uuid',
    );
    expect(query).toHaveBeenCalledWith(
      'ALTER TABLE "core"."timelineActivityType" ADD "triggerFieldUniversalIdentifiers" uuid[]',
    );
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('drops the generic event-routing contract on rollback', async () => {
    await command.down(queryRunner);

    expect(query).toHaveBeenCalledWith(
      'ALTER TABLE "core"."timelineActivityType" DROP COLUMN "targetRelationFieldUniversalIdentifier"',
    );
    expect(query).toHaveBeenCalledWith(
      'ALTER TABLE "core"."timelineActivityType" DROP COLUMN "triggerFieldUniversalIdentifiers"',
    );
    expect(query).toHaveBeenCalledTimes(2);
  });
});
