import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.20.0', 1783615890058)
export class AddListingRequestFieldsToApplicationRegistrationFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD COLUMN IF NOT EXISTS "listingRequestStatus" text NOT NULL DEFAULT 'none'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD COLUMN IF NOT EXISTS "listingRequestedAt" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN "listingRequestStatus"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN "listingRequestedAt"`,
    );
  }
}
