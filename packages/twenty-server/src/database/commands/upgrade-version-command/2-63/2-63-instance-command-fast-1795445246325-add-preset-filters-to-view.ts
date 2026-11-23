import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.63.0', 1795445246325)
export class AddPresetFiltersToViewFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "core"."view_presetfilters_enum" AS ENUM(\'INBOX_OPEN\', \'INBOX_SNOOZED\', \'INBOX_DONE\', \'INBOX_MENTIONED\', \'INBOX_CHANNEL_OPEN\', \'INBOX_CHANNEL_SNOOZED\', \'INBOX_CHANNEL_DONE\')');
    await queryRunner.query('ALTER TABLE "core"."view" ADD "presetFilters" "core"."view_presetfilters_enum" array NOT NULL DEFAULT \'{}\'');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."view" DROP COLUMN "presetFilters"');
    await queryRunner.query('DROP TYPE "core"."view_presetfilters_enum"');
  }
}
