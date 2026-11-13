import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.59.0', 1794573242444)
export class AddBillingArrangementUsageLimitSnapshotFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const billingArrangementTables = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingArrangement'`,
    );

    if (billingArrangementTables.length === 0) {
      return;
    }

    await queryRunner.query('ALTER TABLE "core"."billingArrangement" ADD "usageLimitSnapshot" jsonb');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const billingArrangementTables = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingArrangement'`,
    );

    if (billingArrangementTables.length === 0) {
      return;
    }

    await queryRunner.query('ALTER TABLE "core"."billingArrangement" DROP COLUMN "usageLimitSnapshot"');
  }
}
