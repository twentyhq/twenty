import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// The emailing domain driver is selected globally via the EMAILING_DOMAIN_DRIVER
// config variable; the per-row column was never read and is redundant.
@RegisteredInstanceCommand('2.11.0', 1780926908000)
export class DropEmailingDomainDriverColumnFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."emailingDomain" DROP COLUMN IF EXISTS "driver"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."emailingDomain_driver_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."emailingDomain_driver_enum" AS ENUM('AWS_SES')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."emailingDomain" ADD COLUMN IF NOT EXISTS "driver" "core"."emailingDomain_driver_enum" NOT NULL DEFAULT 'AWS_SES'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."emailingDomain" ALTER COLUMN "driver" DROP DEFAULT`,
    );
  }
}
