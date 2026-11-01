import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.49.0', 1792154197828)
export class AddUserCreditsFallbackToBillingCustomerFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await this.hasBillingCustomerTable(queryRunner))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" ADD COLUMN IF NOT EXISTS "userCreditsFallback" character varying NOT NULL DEFAULT 'WORKSPACE_CREDITS'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await this.hasBillingCustomerTable(queryRunner))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" DROP COLUMN IF EXISTS "userCreditsFallback"`,
    );
  }

  private async hasBillingCustomerTable(
    queryRunner: QueryRunner,
  ): Promise<boolean> {
    const rows = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingCustomer'`,
    );

    return rows.length > 0;
  }
}
