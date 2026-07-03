import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.19.0', 1783094691548)
export class AddPendingMimeCheckToFileFastInstanceCommand
  implements FastInstanceCommand
{
  // A PENDING file is a direct upload whose bytes have not been content-sniffed
  // yet, so its declared mime type is untrusted. Forcing PENDING rows to
  // 'application/octet-stream' guarantees the real mime type is only ever set
  // from server-side detection at completeFileUpload time.
  //
  // Added NOT VALID on purpose: PR that shipped the PENDING status set the mime
  // from the filename extension, so a freshly-upgraded instance may still hold
  // PENDING rows that predate this rule. NOT VALID enforces the invariant on
  // every new and updated row without scanning (and failing on) that legacy
  // backlog — those rows either get overwritten to octet-stream when completed
  // (status flips to UPLOADED, so the check passes) or reaped while pending.
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
