import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// windowSeconds could only express a rolling window, so quota rows would have
// had to overload 0 to mean the billing period and calendar periods were
// unrepresentable. periodCount + periodUnit carry both kinds: a speed window
// is N seconds, a quota period is an anchored calendar or billing unit.
@RegisteredInstanceCommand('2.38.0', 1788198642267, { type: 'slow' })
export class ReshapeUsageLimitPeriodSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."usageLimit" SET "periodCount" = "windowSeconds", "periodUnit" = 'second' WHERE "limitKind" = 'speed'`,
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP CONSTRAINT "UQ_USAGE_LIMIT_SCOPE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP COLUMN "windowSeconds"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD CONSTRAINT "UQ_USAGE_LIMIT_SCOPE" UNIQUE ("workspaceId", "resourceType", "operationType", "spenderType", "spenderId", "limitKind", "periodCount", "periodUnit")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD COLUMN IF NOT EXISTS "windowSeconds" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `UPDATE "core"."usageLimit" SET "windowSeconds" = "periodCount" WHERE "periodUnit" = 'second'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP CONSTRAINT "UQ_USAGE_LIMIT_SCOPE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD CONSTRAINT "UQ_USAGE_LIMIT_SCOPE" UNIQUE ("workspaceId", "resourceType", "operationType", "spenderType", "spenderId", "limitKind", "windowSeconds")`,
    );
  }
}
