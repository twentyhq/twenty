import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.33.0', 1787200160000)
export class RenameEmailingDomainPermanentlySuspendedToSandboxFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
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
