import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.38.0', 1788272351966)
export class RenameEmailingDomainPermanentlySuspendedToSandboxFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await this.hasEnumLabel(queryRunner, 'PERMANENTLY_SUSPENDED'))) {
      return;
    }

    await queryRunner.query(
      `ALTER TYPE "core"."emailingDomain_tenantstatus_enum" RENAME VALUE 'PERMANENTLY_SUSPENDED' TO 'SANDBOX'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await this.hasEnumLabel(queryRunner, 'SANDBOX'))) {
      return;
    }

    await queryRunner.query(
      `ALTER TYPE "core"."emailingDomain_tenantstatus_enum" RENAME VALUE 'SANDBOX' TO 'PERMANENTLY_SUSPENDED'`,
    );
  }

  private async hasEnumLabel(
    queryRunner: QueryRunner,
    enumLabel: string,
  ): Promise<boolean> {
    const [{ exists }] = await queryRunner.query(
      `SELECT EXISTS (
         SELECT 1 FROM pg_enum e
         JOIN pg_type t ON t.oid = e.enumtypid
         JOIN pg_namespace n ON n.oid = t.typnamespace
         WHERE n.nspname = 'core'
           AND t.typname = 'emailingDomain_tenantstatus_enum'
           AND e.enumlabel = $1
       ) AS exists`,
      [enumLabel],
    );

    return exists;
  }
}
