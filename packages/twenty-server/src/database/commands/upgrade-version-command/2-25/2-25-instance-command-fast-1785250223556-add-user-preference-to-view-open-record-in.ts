import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.25.0', 1785250223556)
export class AddUserPreferenceToViewOpenRecordInFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TYPE "core"."view_openrecordin_enum" RENAME TO "view_openrecordin_enum_old"',
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"view_openrecordin_enum\" AS ENUM('SIDE_PANEL', 'RECORD_PAGE', 'USER_PREFERENCE')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" TYPE "core"."view_openrecordin_enum" USING "openRecordIn"::"text"::"core"."view_openrecordin_enum"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" SET DEFAULT \'SIDE_PANEL\'',
    );
    await queryRunner.query('DROP TYPE "core"."view_openrecordin_enum_old"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Views set to the value being removed have to land somewhere before the
    // cast, otherwise the rollback fails on any workspace that used it.
    await queryRunner.query(
      `UPDATE "core"."view" SET "openRecordIn" = 'SIDE_PANEL' WHERE "openRecordIn" = 'USER_PREFERENCE'`,
    );
    await queryRunner.query(
      'CREATE TYPE "core"."view_openrecordin_enum_old" AS ENUM(\'RECORD_PAGE\', \'SIDE_PANEL\')',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" TYPE "core"."view_openrecordin_enum_old" USING "openRecordIn"::"text"::"core"."view_openrecordin_enum_old"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" SET DEFAULT \'SIDE_PANEL\'',
    );
    await queryRunner.query('DROP TYPE "core"."view_openrecordin_enum"');
    await queryRunner.query(
      'ALTER TYPE "core"."view_openrecordin_enum_old" RENAME TO "view_openrecordin_enum"',
    );
  }
}
