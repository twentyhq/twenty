import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Idempotent: this command was re-slotted from timestamp 1783698499446 to keep
// the 2.21 sequence append-only, so it may re-run on instances that already
// applied it under the previous name.
@RegisteredInstanceCommand('2.21.0', 1783945979243)
export class AddLogoFileIdToApplicationRegistrationFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" ADD COLUMN IF NOT EXISTS "logoFileId" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP CONSTRAINT IF EXISTS "UQ_796819fb23559c233e6ebd49f34"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" ADD CONSTRAINT "UQ_796819fb23559c233e6ebd49f34" UNIQUE ("logoFileId")',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP CONSTRAINT IF EXISTS "FK_796819fb23559c233e6ebd49f34"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" ADD CONSTRAINT "FK_796819fb23559c233e6ebd49f34" FOREIGN KEY ("logoFileId") REFERENCES "core"."file"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP CONSTRAINT IF EXISTS "FK_796819fb23559c233e6ebd49f34"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP CONSTRAINT IF EXISTS "UQ_796819fb23559c233e6ebd49f34"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP COLUMN IF EXISTS "logoFileId"',
    );
  }
}
