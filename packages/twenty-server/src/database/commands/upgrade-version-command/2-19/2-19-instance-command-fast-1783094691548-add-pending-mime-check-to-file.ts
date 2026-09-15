import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.19.0', 1783094691548)
export class AddPendingMimeCheckToFileFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP CONSTRAINT IF EXISTS "CHK_FILE_PENDING_MIME_OCTET_STREAM"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD CONSTRAINT "CHK_FILE_PENDING_MIME_OCTET_STREAM" CHECK ("status" != 'PENDING' OR "mimeType" = 'application/octet-stream') NOT VALID`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP CONSTRAINT IF EXISTS "CHK_FILE_PENDING_MIME_OCTET_STREAM"`,
    );
  }
}
