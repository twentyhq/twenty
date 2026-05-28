import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.9.0', 1799100010000)
export class AddNotApplicableMessageChannelSyncStageFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TYPE "core"."messageChannel_syncstage_enum" RENAME TO "messageChannel_syncstage_enum_old"',
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"messageChannel_syncstage_enum\" AS ENUM('PENDING_CONFIGURATION', 'MESSAGE_LIST_FETCH_PENDING', 'MESSAGE_LIST_FETCH_SCHEDULED', 'MESSAGE_LIST_FETCH_ONGOING', 'MESSAGES_IMPORT_PENDING', 'MESSAGES_IMPORT_SCHEDULED', 'MESSAGES_IMPORT_ONGOING', 'FAILED', 'NOT_APPLICABLE')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."messageChannel" ALTER COLUMN "syncStage" TYPE "core"."messageChannel_syncstage_enum" USING "syncStage"::"text"::"core"."messageChannel_syncstage_enum"',
    );
    await queryRunner.query(
      'DROP TYPE "core"."messageChannel_syncstage_enum_old"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remap rows whose syncStage won't exist after we narrow the type back
    // down — otherwise the USING cast below fails on 'NOT_APPLICABLE'.
    await queryRunner.query(
      `UPDATE "core"."messageChannel" SET "syncStage" = 'FAILED' WHERE "syncStage" = 'NOT_APPLICABLE'`,
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"messageChannel_syncstage_enum_old\" AS ENUM('PENDING_CONFIGURATION', 'MESSAGE_LIST_FETCH_PENDING', 'MESSAGE_LIST_FETCH_SCHEDULED', 'MESSAGE_LIST_FETCH_ONGOING', 'MESSAGES_IMPORT_PENDING', 'MESSAGES_IMPORT_SCHEDULED', 'MESSAGES_IMPORT_ONGOING', 'FAILED')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."messageChannel" ALTER COLUMN "syncStage" TYPE "core"."messageChannel_syncstage_enum_old" USING "syncStage"::"text"::"core"."messageChannel_syncstage_enum_old"',
    );
    await queryRunner.query(
      'DROP TYPE "core"."messageChannel_syncstage_enum"',
    );
    await queryRunner.query(
      'ALTER TYPE "core"."messageChannel_syncstage_enum_old" RENAME TO "messageChannel_syncstage_enum"',
    );
  }
}
