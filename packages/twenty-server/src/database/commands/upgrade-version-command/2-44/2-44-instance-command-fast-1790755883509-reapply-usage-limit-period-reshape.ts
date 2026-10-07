import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.44.0', 1790755883509)
export class ReapplyUsageLimitPeriodReshapeFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ isPeriodReshapeMissing }]: [{ isPeriodReshapeMissing: boolean }] =
      await queryRunner.query(
        `SELECT EXISTS (
           SELECT 1 FROM pg_attribute
           WHERE attrelid = to_regclass($1)
             AND attname = $2
             AND NOT attisdropped
         ) AS "isPeriodReshapeMissing"`,
        ['"core"."usageLimit"', 'windowSeconds'],
      );

    if (!isPeriodReshapeMissing) {
      return;
    }

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

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
