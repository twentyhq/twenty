import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.58.0', 1794243399000)
export class AddRemoteOriginToFileFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."file_status_enum" ADD VALUE IF NOT EXISTS 'REMOTE'`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."file" ADD COLUMN IF NOT EXISTS "remoteOrigin" jsonb',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "core"."file" WHERE "status" = 'REMOTE'`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."file" DROP COLUMN IF EXISTS "remoteOrigin"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP CONSTRAINT IF EXISTS "CHK_FILE_PENDING_MIME_OCTET_STREAM"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."file_status_enum_old" AS ENUM('PENDING', 'UPLOADED')`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."file" ALTER COLUMN "status" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."file" ALTER COLUMN "status" TYPE "core"."file_status_enum_old" USING "status"::"text"::"core"."file_status_enum_old"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ALTER COLUMN "status" SET DEFAULT 'UPLOADED'`,
    );
    await queryRunner.query('DROP TYPE "core"."file_status_enum"');
    await queryRunner.query(
      'ALTER TYPE "core"."file_status_enum_old" RENAME TO "file_status_enum"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD CONSTRAINT "CHK_FILE_PENDING_MIME_OCTET_STREAM" CHECK ("status" != 'PENDING' OR "mimeType" = 'application/octet-stream') NOT VALID`,
    );
  }
}
