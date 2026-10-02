import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Replaced by the campaignDelivery and messageSuppression workspace objects in
// 2.43, which intentionally did not copy rows over (only test sends existed).
@RegisteredInstanceCommand('2.45.0', 1790842027068)
export class DropLegacyCampaignSendingCoreTablesFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."campaignDelivery"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."messageSuppression"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."messageSuppression_reason_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."messageSuppression_source_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."messageSuppression_reason_enum" AS ENUM ('BOUNCE', 'COMPLAINT', 'UNSUBSCRIBE'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."messageSuppression_source_enum" AS ENUM ('WEBHOOK', 'SYSTEM'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."messageSuppression" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "emailAddress" character varying NOT NULL,
        "reason" "core"."messageSuppression_reason_enum" NOT NULL,
        "source" "core"."messageSuppression_source_enum" NOT NULL,
        "providerEventId" character varying,
        "unsubscribeTopicId" uuid,
        "workspaceId" uuid NOT NULL,
        CONSTRAINT "PK_messageSuppression_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_6eba121ed8e57afaa1f052cb685" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_MESSAGE_SUPPRESSION_GLOBAL_UNIQUE"
        ON "core"."messageSuppression" ("workspaceId", "emailAddress")
        WHERE "unsubscribeTopicId" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_MESSAGE_SUPPRESSION_TOPIC_UNIQUE"
        ON "core"."messageSuppression" ("workspaceId", "emailAddress", "unsubscribeTopicId")
        WHERE "unsubscribeTopicId" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_MESSAGE_SUPPRESSION_WORKSPACE_ID"
        ON "core"."messageSuppression" ("workspaceId")`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."campaignDelivery" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "campaignId" uuid NOT NULL, "personId" uuid NOT NULL, "recipientEmail" character varying NOT NULL, "state" character varying NOT NULL DEFAULT 'QUEUED', "skipReason" character varying, "failureReason" character varying, "claimToken" uuid, "claimExpiresAt" TIMESTAMP WITH TIME ZONE, "providerMessageId" character varying, "sentAt" TIMESTAMP WITH TIME ZONE, "deliveredAt" TIMESTAMP WITH TIME ZONE, "bouncedAt" TIMESTAMP WITH TIME ZONE, "complainedAt" TIMESTAMP WITH TIME ZONE, "rejectedAt" TIMESTAMP WITH TIME ZONE, "renderingFailedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "CHK_CAMPAIGN_DELIVERY_CLAIM_HAS_LEASE" CHECK ("state" <> 'SENDING' OR "claimExpiresAt" IS NOT NULL), CONSTRAINT "CHK_CAMPAIGN_DELIVERY_CLAIM_IS_WHOLE" CHECK (("claimToken" IS NULL) = ("claimExpiresAt" IS NULL)), CONSTRAINT "PK_ceb21bdf267212ad5d7e0c3ce75" PRIMARY KEY ("id"), CONSTRAINT "FK_9121b71f743c6f44efa2357021c" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_CAMPAIGN_DELIVERY_PROVIDER_MESSAGE_ID" ON "core"."campaignDelivery" ("workspaceId", "providerMessageId") WHERE "providerMessageId" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_CAMPAIGN_DELIVERY_COUNTS" ON "core"."campaignDelivery" ("workspaceId", "campaignId", "state")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_CAMPAIGN_DELIVERY_EXPIRED_CLAIM" ON "core"."campaignDelivery" ("claimExpiresAt") WHERE "state" = 'SENDING'`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_CAMPAIGN_DELIVERY_UNFINISHED" ON "core"."campaignDelivery" ("campaignId") WHERE "state" IN ('QUEUED', 'SENDING')`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_CAMPAIGN_DELIVERY_UNIQUE" ON "core"."campaignDelivery" ("campaignId", "personId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_CAMPAIGN_DELIVERY_CLAIM_TOKEN" ON "core"."campaignDelivery" ("workspaceId", "claimToken") WHERE "claimToken" IS NOT NULL`,
    );
  }
}
