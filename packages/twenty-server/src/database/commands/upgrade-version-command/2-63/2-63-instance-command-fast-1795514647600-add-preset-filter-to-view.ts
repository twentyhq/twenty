import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.63.0', 1795514647600)
export class AddPresetFilterToViewFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "core"."view_presetfilter_enum" AS ENUM(\'INBOX_OPEN\', \'INBOX_SNOOZED\', \'INBOX_DONE\', \'INBOX_MENTIONS\', \'INBOX_CHANNEL_OPEN\', \'INBOX_CHANNEL_SNOOZED\', \'INBOX_CHANNEL_DONE\')');
    await queryRunner.query('ALTER TABLE "core"."view" ADD "presetFilter" "core"."view_presetfilter_enum"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."view" DROP COLUMN "presetFilter"');
    await queryRunner.query('DROP TYPE "core"."view_presetfilter_enum"');
  }
}
