import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.11.0', 1780754108000)
export class AddLogEmailingDomainDriverFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."emailingDomain_driver_enum" ADD VALUE IF NOT EXISTS 'LOG' AFTER 'AWS_SES'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."emailingDomain" ALTER COLUMN "driver" TYPE character varying`,
    );
    await queryRunner.query(
      `UPDATE "core"."emailingDomain" SET "driver" = 'AWS_SES' WHERE "driver" = 'LOG'`,
    );
    await queryRunner.query(`DROP TYPE "core"."emailingDomain_driver_enum"`);
    await queryRunner.query(
      `CREATE TYPE "core"."emailingDomain_driver_enum" AS ENUM('AWS_SES')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."emailingDomain" ALTER COLUMN "driver" TYPE "core"."emailingDomain_driver_enum" USING "driver"::"core"."emailingDomain_driver_enum"`,
    );
  }
}
