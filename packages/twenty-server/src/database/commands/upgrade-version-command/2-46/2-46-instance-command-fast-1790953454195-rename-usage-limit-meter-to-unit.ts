import { isNonEmptyArray } from 'twenty-shared/utils';
import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const QUANTITY_UNIT_BY_OPERATION_SQL = `CASE "operationType"
  WHEN 'AI_CHAT_TOKEN' THEN 'TOKEN'
  WHEN 'AI_WORKFLOW_TOKEN' THEN 'TOKEN'
  WHEN 'WEB_SEARCH' THEN 'INVOCATION'
  WHEN 'WORKFLOW_EXECUTION' THEN 'INVOCATION'
  WHEN 'CODE_EXECUTION' THEN 'INVOCATION'
  WHEN 'EMAIL_SEND' THEN 'INVOCATION'
  WHEN 'MESSAGE_CAMPAIGN_SEND' THEN 'INVOCATION'
  WHEN 'API_REQUEST' THEN 'REQUEST'
  WHEN 'WEBHOOK_CALL' THEN 'REQUEST'
  WHEN 'STORAGE_FILE' THEN 'FILE'
  WHEN 'RECORD_WRITE' THEN 'RECORD'
END`;

const UNIT_FROM_METER_SQL = `CASE "meter"
  WHEN 'creditsUsedMicro' THEN 'CREDIT'
  WHEN 'bytes' THEN 'BYTE'
  WHEN 'quantity' THEN (${QUANTITY_UNIT_BY_OPERATION_SQL})
END`;

const METER_FROM_UNIT_SQL = `CASE "unit"
  WHEN 'CREDIT' THEN 'creditsUsedMicro'
  WHEN 'BYTE' THEN 'bytes'
  ELSE 'quantity'
END`;

type UnmappableUsageLimit = {
  id: string;
  resourceType: string;
  operationType: string;
  limitKind: string;
  meter: string;
};

@RegisteredInstanceCommand('2.46.0', 1790953454195)
export class RenameUsageLimitMeterToUnitFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const unmappableUsageLimits: UnmappableUsageLimit[] =
      await queryRunner.query(
        `SELECT "id", "resourceType", "operationType", "limitKind", "meter"
         FROM "core"."usageLimit"
         WHERE (${UNIT_FROM_METER_SQL}) IS NULL`,
      );

    if (isNonEmptyArray(unmappableUsageLimits)) {
      throw new Error(
        `Cannot map the meter of these usage limits to a unit: ${unmappableUsageLimits
          .map(
            ({ id, resourceType, operationType, limitKind, meter }) =>
              `${id} (${resourceType} ${operationType} ${limitKind} ${meter})`,
          )
          .join(', ')}`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP CONSTRAINT "UQ_USAGE_LIMIT_SCOPE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ALTER COLUMN "meter" TYPE character varying USING (${UNIT_FROM_METER_SQL})`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" RENAME COLUMN "meter" TO "unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD CONSTRAINT "UQ_USAGE_LIMIT_SCOPE" UNIQUE ("workspaceId", "resourceType", "operationType", "spenderType", "spenderId", "limitKind", "periodCount", "periodUnit", "unit")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP CONSTRAINT "UQ_USAGE_LIMIT_SCOPE"`,
    );
    await queryRunner.query(
      `DELETE FROM "core"."usageLimit"
       WHERE "unit" NOT IN ('CREDIT', 'BYTE')
         AND "unit" IS DISTINCT FROM (${QUANTITY_UNIT_BY_OPERATION_SQL})`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ALTER COLUMN "unit" TYPE character varying USING (${METER_FROM_UNIT_SQL})`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" RENAME COLUMN "unit" TO "meter"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD CONSTRAINT "UQ_USAGE_LIMIT_SCOPE" UNIQUE ("workspaceId", "resourceType", "operationType", "spenderType", "spenderId", "limitKind", "periodCount", "periodUnit", "meter")`,
    );
  }
}
