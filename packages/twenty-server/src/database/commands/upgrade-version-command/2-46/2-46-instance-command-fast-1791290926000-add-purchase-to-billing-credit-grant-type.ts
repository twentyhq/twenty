import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.46.0', 1791290926000)
export class AddPurchaseToBillingCreditGrantTypeFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const isBillingCreditGrantTablePresent = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingCreditGrant'`,
    );

    if (isBillingCreditGrantTablePresent.length === 0) {
      return;
    }

    await queryRunner.query(
      `ALTER TYPE "core"."billingCreditGrant_type_enum" ADD VALUE IF NOT EXISTS 'PURCHASE'`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
