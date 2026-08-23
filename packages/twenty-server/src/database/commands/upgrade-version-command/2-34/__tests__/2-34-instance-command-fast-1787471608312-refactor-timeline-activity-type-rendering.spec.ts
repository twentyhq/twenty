import { type QueryRunner } from 'typeorm';

import { RefactorTimelineActivityTypeRenderingFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-34/2-34-instance-command-fast-1787471608312-refactor-timeline-activity-type-rendering';

describe('RefactorTimelineActivityTypeRenderingFastInstanceCommand', () => {
  const query = jest.fn();
  const queryRunner = { query } as unknown as QueryRunner;
  const command = new RefactorTimelineActivityTypeRenderingFastInstanceCommand();

  beforeEach(() => {
    query.mockReset();
  });

  it('adds the app front component reference without dropping rolling-release storage', async () => {
    await command.up(queryRunner);

    expect(query).toHaveBeenCalledWith(
      'ALTER TABLE "core"."timelineActivityType" ADD "frontComponentUniversalIdentifier" uuid',
    );
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('drops the app front component reference on rollback', async () => {
    await command.down(queryRunner);

    expect(query).toHaveBeenCalledWith(
      'ALTER TABLE "core"."timelineActivityType" DROP COLUMN "frontComponentUniversalIdentifier"',
    );
    expect(query).toHaveBeenCalledTimes(1);
  });
});
