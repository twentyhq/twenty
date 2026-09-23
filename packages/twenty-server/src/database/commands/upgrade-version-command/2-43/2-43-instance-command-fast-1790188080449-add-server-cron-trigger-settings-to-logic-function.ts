import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.43.0', 1790188080449)
export class AddServerCronTriggerSettingsToLogicFunctionFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."logicFunction" ADD COLUMN IF NOT EXISTS "serverCronTriggerSettings" jsonb',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_LOGIC_FUNCTION_SERVER_CRON_TRIGGER_SETTINGS" ON "core"."logicFunction" ("workspaceId") WHERE "serverCronTriggerSettings" IS NOT NULL AND "deletedAt" IS NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_LOGIC_FUNCTION_SERVER_CRON_TRIGGER_SETTINGS"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."logicFunction" DROP COLUMN IF EXISTS "serverCronTriggerSettings"',
    );
  }
}
