import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.38.0', 1788198642266)
export class AddUsageLimitPeriodColumnsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD COLUMN IF NOT EXISTS "periodCount" integer NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD COLUMN IF NOT EXISTS "periodUnit" character varying NOT NULL DEFAULT 'billingPeriod'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD COLUMN IF NOT EXISTS "meter" character varying NOT NULL DEFAULT 'creditsUsedMicro'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP COLUMN IF EXISTS "periodCount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP COLUMN IF EXISTS "periodUnit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP COLUMN IF EXISTS "meter"`,
    );
  }
}
