import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.9.0', 1799000020000)
export class EmailingDomainTenantStatusAndGlobalUniquenessFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE \"core\".\"emailingDomain_tenantstatus_enum\" AS ENUM('ACTIVE', 'PAUSED', 'PERMANENTLY_SUSPENDED')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."emailingDomain" ADD "tenantStatus" "core"."emailingDomain_tenantstatus_enum" NOT NULL DEFAULT \'ACTIVE\'',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."emailingDomain" DROP CONSTRAINT "IDX_EMAILING_DOMAIN_DOMAIN_WORKSPACE_ID_UNIQUE"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."emailingDomain" ADD CONSTRAINT "IDX_EMAILING_DOMAIN_DOMAIN_UNIQUE" UNIQUE ("domain")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."emailingDomain" DROP CONSTRAINT "IDX_EMAILING_DOMAIN_DOMAIN_UNIQUE"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."emailingDomain" ADD CONSTRAINT "IDX_EMAILING_DOMAIN_DOMAIN_WORKSPACE_ID_UNIQUE" UNIQUE ("domain", "workspaceId")',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."emailingDomain" DROP COLUMN "tenantStatus"',
    );
    await queryRunner.query(
      'DROP TYPE "core"."emailingDomain_tenantstatus_enum"',
    );
  }
}
