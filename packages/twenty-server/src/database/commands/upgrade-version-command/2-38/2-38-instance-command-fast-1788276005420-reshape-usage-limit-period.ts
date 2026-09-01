import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.38.0', 1788276005420)
export class ReshapeUsageLimitPeriodFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD COLUMN IF NOT EXISTS "periodCount" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD COLUMN IF NOT EXISTS "periodUnit" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD COLUMN IF NOT EXISTS "meter" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP CONSTRAINT "UQ_USAGE_LIMIT_SCOPE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP COLUMN "windowSeconds"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD CONSTRAINT "UQ_USAGE_LIMIT_SCOPE" UNIQUE ("workspaceId", "resourceType", "operationType", "spenderType", "spenderId", "limitKind", "periodCount", "periodUnit", "meter")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP CONSTRAINT "UQ_USAGE_LIMIT_SCOPE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD COLUMN IF NOT EXISTS "windowSeconds" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP COLUMN IF EXISTS "periodCount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP COLUMN IF EXISTS "periodUnit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP COLUMN IF EXISTS "meter"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD CONSTRAINT "UQ_USAGE_LIMIT_SCOPE" UNIQUE ("workspaceId", "resourceType", "operationType", "spenderType", "spenderId", "limitKind", "windowSeconds")`,
    );
  }
}
