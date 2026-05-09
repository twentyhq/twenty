import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.4.0', 1777100000000)
export class AddMetadataToBillingPriceFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingPrice'`,
    );

    if (tableExists.length === 0) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice" ADD COLUMN IF NOT EXISTS "metadata" jsonb NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingPrice'`,
    );

    if (tableExists.length === 0) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice" DROP COLUMN IF EXISTS "metadata"`,
    );
  }
}
