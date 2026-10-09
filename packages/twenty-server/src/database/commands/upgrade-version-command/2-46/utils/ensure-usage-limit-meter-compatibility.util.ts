import { type QueryRunner } from 'typeorm';

const unitFromMeterSql = (row = '') => `CASE ${row}"meter"
  WHEN 'creditsUsedMicro' THEN 'CREDIT'
  WHEN 'bytes' THEN 'BYTE'
  WHEN 'quantity' THEN CASE ${row}"operationType"
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
  END
END`;

const meterFromUnitSql = (row = '') => `CASE ${row}"unit"
  WHEN 'CREDIT' THEN 'creditsUsedMicro'
  WHEN 'BYTE' THEN 'bytes'
  ELSE 'quantity'
END`;

export const ensureUsageLimitMeterCompatibility = async (
  queryRunner: QueryRunner,
): Promise<void> => {
  const columns: { column_name: string }[] = await queryRunner.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'core' AND table_name = 'usageLimit'
       AND column_name IN ('meter', 'unit')`,
  );

  if (columns.length === 2) {
    const triggers: { oid: number }[] = await queryRunner.query(
      `SELECT oid FROM pg_trigger
       WHERE tgrelid = '"core"."usageLimit"'::regclass
         AND tgname = 'syncUsageLimitMeterAndUnit' AND NOT tgisinternal`,
    );

    if (triggers.length > 0) {
      return;
    }
  }

  if (!columns.some(({ column_name }) => column_name === 'unit')) {
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD COLUMN "unit" character varying`,
    );
    // A mixed-operation quantity has no equivalent unit; retain its row for reconciliation.
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ALTER COLUMN "unit" TYPE character varying USING (${unitFromMeterSql()})`,
    );
  }

  if (!columns.some(({ column_name }) => column_name === 'meter')) {
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD COLUMN "meter" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ALTER COLUMN "meter" TYPE character varying USING (${meterFromUnitSql()})`,
    );
  }

  await queryRunner.query(
    `ALTER TABLE "core"."usageLimit" ALTER COLUMN "meter" SET NOT NULL,
     ALTER COLUMN "unit" DROP NOT NULL`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."usageLimit" DROP CONSTRAINT "UQ_USAGE_LIMIT_SCOPE"`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."usageLimit" ADD CONSTRAINT "UQ_USAGE_LIMIT_SCOPE"
     UNIQUE ("workspaceId", "resourceType", "operationType", "spenderType", "spenderId", "limitKind", "periodCount", "periodUnit", "unit")`,
  );
  await queryRunner.query(`
    CREATE OR REPLACE FUNCTION "core"."syncUsageLimitMeterAndUnit"()
    RETURNS trigger LANGUAGE plpgsql AS $function$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        IF NEW."unit" IS NOT NULL THEN
          NEW."meter" := ${meterFromUnitSql('NEW.')};
        ELSE
          NEW."unit" := ${unitFromMeterSql('NEW.')};
        END IF;
      ELSIF NEW."unit" IS DISTINCT FROM OLD."unit" THEN
        NEW."meter" := ${meterFromUnitSql('NEW.')};
      ELSIF NEW."meter" IS DISTINCT FROM OLD."meter"
         OR NEW."operationType" IS DISTINCT FROM OLD."operationType" THEN
        NEW."unit" := ${unitFromMeterSql('NEW.')};
      END IF;
      RETURN NEW;
    END;
    $function$;
  `);
  await queryRunner.query(
    `DROP TRIGGER IF EXISTS "syncUsageLimitMeterAndUnit" ON "core"."usageLimit"`,
  );
  await queryRunner.query(
    `CREATE TRIGGER "syncUsageLimitMeterAndUnit"
     BEFORE INSERT OR UPDATE ON "core"."usageLimit"
     FOR EACH ROW EXECUTE FUNCTION "core"."syncUsageLimitMeterAndUnit"()`,
  );
};
