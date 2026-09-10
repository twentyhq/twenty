import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.38.0', 1788367160891)
export class ReshapeUsageLimitPeriodFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP CONSTRAINT "UQ_USAGE_LIMIT_SCOPE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" RENAME COLUMN "windowSeconds" TO "periodCount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ALTER COLUMN "periodCount" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD COLUMN "periodUnit" character varying NOT NULL DEFAULT 'second'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ALTER COLUMN "periodUnit" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD COLUMN "meter" character varying NOT NULL DEFAULT 'quantity'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ALTER COLUMN "meter" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP COLUMN "limitValueType"`,
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
      `DELETE FROM "core"."usageLimit" WHERE "limitKind" = 'quota'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD COLUMN "limitValueType" character varying NOT NULL DEFAULT 'absolute'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP COLUMN "periodUnit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP COLUMN "meter"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ALTER COLUMN "periodCount" SET DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" RENAME COLUMN "periodCount" TO "windowSeconds"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD CONSTRAINT "UQ_USAGE_LIMIT_SCOPE" UNIQUE ("workspaceId", "resourceType", "operationType", "spenderType", "spenderId", "limitKind", "windowSeconds")`,
    );
  }
}
