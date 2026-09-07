import { type QueryRunner } from 'typeorm';

import { DropTimelineActivityTypeRendererFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-35/2-35-instance-command-fast-1787648000001-drop-timeline-activity-type-renderer';
import { DROP_TIMELINE_ACTIVITY_TYPE_RENDERER_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-35/drop-timeline-activity-type-renderer-upgrade-command-name.constant';
import { getRegisteredInstanceCommandMetadata } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';

describe('DropTimelineActivityTypeRendererFastInstanceCommand', () => {
  const command = new DropTimelineActivityTypeRendererFastInstanceCommand();

  it('has a name constant matching its registered name', () => {
    const metadata = getRegisteredInstanceCommandMetadata(
      DropTimelineActivityTypeRendererFastInstanceCommand,
    );

    expect(metadata).toEqual({
      version: '2.35.0',
      timestamp: 1787648000001,
      type: 'fast',
    });
    expect(
      `${metadata?.version}_${DropTimelineActivityTypeRendererFastInstanceCommand.name}_${metadata?.timestamp}`,
    ).toBe(DROP_TIMELINE_ACTIVITY_TYPE_RENDERER_UPGRADE_COMMAND_NAME);
  });

  it('drops and restores the renderer column', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const queryRunner = { query } as unknown as QueryRunner;

    await command.up(queryRunner);
    await command.down(queryRunner);

    expect(query.mock.calls.map(([statement]) => statement)).toEqual([
      'ALTER TABLE "core"."timelineActivityType" DROP COLUMN IF EXISTS "renderer"',
      'ALTER TABLE "core"."timelineActivityType" ADD COLUMN IF NOT EXISTS "renderer" character varying',
    ]);
  });
});
