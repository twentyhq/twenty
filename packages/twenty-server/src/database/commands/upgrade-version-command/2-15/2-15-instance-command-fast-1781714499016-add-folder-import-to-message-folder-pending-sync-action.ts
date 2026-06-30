import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.15.0', 1781714499016)
export class AddFolderImportToMessageFolderPendingSyncActionFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TYPE "core"."messageFolder_pendingsyncaction_enum" RENAME TO "messageFolder_pendingsyncaction_enum_old"');
    await queryRunner.query('CREATE TYPE "core"."messageFolder_pendingsyncaction_enum" AS ENUM(\'FOLDER_DELETION\', \'FOLDER_IMPORT\', \'NONE\')');
    await queryRunner.query('ALTER TABLE "core"."messageFolder" ALTER COLUMN "pendingSyncAction" DROP DEFAULT');
    await queryRunner.query('ALTER TABLE "core"."messageFolder" ALTER COLUMN "pendingSyncAction" TYPE "core"."messageFolder_pendingsyncaction_enum" USING "pendingSyncAction"::"text"::"core"."messageFolder_pendingsyncaction_enum"');
    await queryRunner.query('ALTER TABLE "core"."messageFolder" ALTER COLUMN "pendingSyncAction" SET DEFAULT \'NONE\'');
    await queryRunner.query('DROP TYPE "core"."messageFolder_pendingsyncaction_enum_old"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "core"."messageFolder_pendingsyncaction_enum_old" AS ENUM(\'FOLDER_DELETION\', \'NONE\')');
    await queryRunner.query('ALTER TABLE "core"."messageFolder" ALTER COLUMN "pendingSyncAction" DROP DEFAULT');
    await queryRunner.query('ALTER TABLE "core"."messageFolder" ALTER COLUMN "pendingSyncAction" TYPE "core"."messageFolder_pendingsyncaction_enum_old" USING (CASE WHEN "pendingSyncAction"::"text" = \'FOLDER_IMPORT\' THEN \'NONE\' ELSE "pendingSyncAction"::"text" END)::"core"."messageFolder_pendingsyncaction_enum_old"');
    await queryRunner.query('ALTER TABLE "core"."messageFolder" ALTER COLUMN "pendingSyncAction" SET DEFAULT \'NONE\'');
    await queryRunner.query('DROP TYPE "core"."messageFolder_pendingsyncaction_enum"');
    await queryRunner.query('ALTER TYPE "core"."messageFolder_pendingsyncaction_enum_old" RENAME TO "messageFolder_pendingsyncaction_enum"');
  }
}
