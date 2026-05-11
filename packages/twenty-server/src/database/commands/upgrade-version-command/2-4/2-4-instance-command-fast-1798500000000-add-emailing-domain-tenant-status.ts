import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.4.0', 1798500000000)
export class AddEmailingDomainTenantStatusFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."emailingDomain_tenantStatus_enum" AS ENUM('ACTIVE', 'PAUSED', 'PERMANENTLY_SUSPENDED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."emailingDomain" ADD COLUMN "tenantStatus" "core"."emailingDomain_tenantStatus_enum" NOT NULL DEFAULT 'ACTIVE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."emailingDomain" DROP COLUMN "tenantStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."emailingDomain_tenantStatus_enum"`,
    );
  }
}
