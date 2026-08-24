import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.35.0', 1787613096938)
export class CreateCampaignDeliveryFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."campaignDelivery" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "campaignId" uuid NOT NULL, "messageId" uuid NOT NULL, "personId" uuid, "recipientEmail" character varying NOT NULL, "state" character varying NOT NULL DEFAULT \'QUEUED\', "skipReason" character varying, "failureReason" character varying, "claimToken" uuid, "claimExpiresAt" TIMESTAMP WITH TIME ZONE, "providerMessageId" character varying, "sentAt" TIMESTAMP WITH TIME ZONE, "deliveredAt" TIMESTAMP WITH TIME ZONE, "bouncedAt" TIMESTAMP WITH TIME ZONE, "complainedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "CHK_CAMPAIGN_DELIVERY_CLAIM_HAS_LEASE" CHECK ("state" <> \'SENDING\' OR "claimExpiresAt" IS NOT NULL), CONSTRAINT "PK_ceb21bdf267212ad5d7e0c3ce75" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_CAMPAIGN_DELIVERY_PROVIDER_MESSAGE_ID" ON "core"."campaignDelivery" ("workspaceId", "providerMessageId") WHERE "providerMessageId" IS NOT NULL');
    await queryRunner.query('CREATE INDEX "IDX_CAMPAIGN_DELIVERY_COUNTS" ON "core"."campaignDelivery" ("workspaceId", "campaignId", "state") ');
    await queryRunner.query('CREATE INDEX "IDX_CAMPAIGN_DELIVERY_EXPIRED_CLAIM" ON "core"."campaignDelivery" ("claimExpiresAt") WHERE "state" = \'SENDING\'');
    await queryRunner.query('CREATE INDEX "IDX_CAMPAIGN_DELIVERY_UNFINISHED" ON "core"."campaignDelivery" ("campaignId") WHERE "state" IN (\'QUEUED\', \'SENDING\')');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_CAMPAIGN_DELIVERY_UNIQUE" ON "core"."campaignDelivery" ("campaignId", "personId") ');
    await queryRunner.query('ALTER TABLE "core"."campaignDelivery" ADD CONSTRAINT "FK_9121b71f743c6f44efa2357021c" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."campaignDelivery" DROP CONSTRAINT "FK_9121b71f743c6f44efa2357021c"');
    await queryRunner.query('DROP INDEX "core"."IDX_CAMPAIGN_DELIVERY_UNIQUE"');
    await queryRunner.query('DROP INDEX "core"."IDX_CAMPAIGN_DELIVERY_UNFINISHED"');
    await queryRunner.query('DROP INDEX "core"."IDX_CAMPAIGN_DELIVERY_EXPIRED_CLAIM"');
    await queryRunner.query('DROP INDEX "core"."IDX_CAMPAIGN_DELIVERY_COUNTS"');
    await queryRunner.query('DROP INDEX "core"."IDX_CAMPAIGN_DELIVERY_PROVIDER_MESSAGE_ID"');
    await queryRunner.query('DROP TABLE "core"."campaignDelivery"');
  }
}
