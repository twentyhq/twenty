import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('1.22.0', 1776078919203)
export class AddCreditBalanceToBillingCustomerFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingCustomer'`,
    );

    if (tableExists.length === 0) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" ADD COLUMN IF NOT EXISTS "creditBalanceMicro" bigint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" DROP COLUMN IF EXISTS "creditBalanceMicro"`,
    );
  }
}
