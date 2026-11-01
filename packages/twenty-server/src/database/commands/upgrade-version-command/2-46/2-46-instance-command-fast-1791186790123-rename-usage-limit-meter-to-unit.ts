import { QueryRunner } from 'typeorm';

import { ensureUsageLimitMeterCompatibility } from 'src/database/commands/upgrade-version-command/2-46/utils/ensure-usage-limit-meter-compatibility.util';
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

const METER_FROM_UNIT_SQL = `CASE "unit"
  WHEN 'CREDIT' THEN 'creditsUsedMicro'
  WHEN 'BYTE' THEN 'bytes'
  ELSE 'quantity'
END`;

@RegisteredInstanceCommand('2.46.0', 1791186790123)
export class RenameUsageLimitMeterToUnitFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await ensureUsageLimitMeterCompatibility(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS "syncUsageLimitMeterAndUnit" ON "core"."usageLimit"`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS "core"."syncUsageLimitMeterAndUnit"()`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP COLUMN IF EXISTS "meter"`,
    );
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
      `ALTER TABLE "core"."usageLimit" ALTER COLUMN "meter" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD CONSTRAINT "UQ_USAGE_LIMIT_SCOPE" UNIQUE ("workspaceId", "resourceType", "operationType", "spenderType", "spenderId", "limitKind", "periodCount", "periodUnit", "meter")`,
    );
  }
}
