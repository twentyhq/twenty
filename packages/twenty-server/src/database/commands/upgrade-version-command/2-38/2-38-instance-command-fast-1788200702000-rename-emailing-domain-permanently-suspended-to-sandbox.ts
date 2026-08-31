import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.38.0', 1788200702000)
export class RenameEmailingDomainPermanentlySuspendedToSandboxFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ exists }] = await queryRunner.query(
      `SELECT EXISTS (
         SELECT 1 FROM pg_enum e
         JOIN pg_type t ON t.oid = e.enumtypid
         JOIN pg_namespace n ON n.oid = t.typnamespace
         WHERE n.nspname = 'core'
           AND t.typname = 'emailingDomain_tenantstatus_enum'
           AND e.enumlabel = 'PERMANENTLY_SUSPENDED'
       ) AS exists`,
    );

    if (!exists) {
      return;
    }

    await queryRunner.query(
      `ALTER TYPE "core"."emailingDomain_tenantstatus_enum" RENAME VALUE 'PERMANENTLY_SUSPENDED' TO 'SANDBOX'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."emailingDomain_tenantstatus_enum" RENAME VALUE 'SANDBOX' TO 'PERMANENTLY_SUSPENDED'`,
    );
  }
}
