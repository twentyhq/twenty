import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.40.0', 1788866486549)
export class AddCampaignClickTrackingFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."emailingDomain_clicktrackinghostnamestatus_enum" AS ENUM('PENDING', 'ACTIVE', 'FAILED')`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."emailingDomain"
         ADD "clickTrackingEnabled" boolean NOT NULL DEFAULT false,
         ADD "clickTrackingHostname" varchar,
         ADD "clickTrackingHostnameId" varchar,
         ADD "clickTrackingHostnameStatus" "core"."emailingDomain_clicktrackinghostnamestatus_enum"`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_EMAILING_DOMAIN_CLICK_TRACKING_HOSTNAME" ON "core"."emailingDomain" ("clickTrackingHostname")`,
    );

    await queryRunner.query(
      `CREATE TABLE "core"."messageCampaignLink" (
         "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
         "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
         "workspaceId" uuid NOT NULL,
         "messageCampaignId" uuid NOT NULL,
         "url" text NOT NULL,
         "urlHash" character(64) NOT NULL,
         CONSTRAINT "PK_messageCampaignLink_id" PRIMARY KEY ("id"),
         CONSTRAINT "FK_messageCampaignLink_workspaceId" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE
       )`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_MESSAGE_CAMPAIGN_LINK_URL_UNIQUE" ON "core"."messageCampaignLink" ("workspaceId", "messageCampaignId", "urlHash")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_MESSAGE_CAMPAIGN_LINK_CAMPAIGN_ID" ON "core"."messageCampaignLink" ("workspaceId", "messageCampaignId")`,
    );

    await queryRunner.query(
      `CREATE TABLE "core"."messageCampaignLinkClick" (
         "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
         "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
         "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
         "workspaceId" uuid NOT NULL,
         "messageCampaignLinkId" uuid NOT NULL,
         "messageId" uuid NOT NULL,
         "clickCount" integer NOT NULL DEFAULT 1,
         "lastClickedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
         CONSTRAINT "PK_messageCampaignLinkClick_id" PRIMARY KEY ("id"),
         CONSTRAINT "FK_messageCampaignLinkClick_workspaceId" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE,
         CONSTRAINT "FK_messageCampaignLinkClick_linkId" FOREIGN KEY ("messageCampaignLinkId") REFERENCES "core"."messageCampaignLink"("id") ON DELETE CASCADE
       )`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_MESSAGE_CAMPAIGN_LINK_CLICK_RECIPIENT_UNIQUE" ON "core"."messageCampaignLinkClick" ("messageCampaignLinkId", "messageId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_MESSAGE_CAMPAIGN_LINK_CLICK_MESSAGE_ID" ON "core"."messageCampaignLinkClick" ("workspaceId", "messageId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE "core"."messageCampaignLinkClick"`,
    );

    await queryRunner.query(`DROP TABLE "core"."messageCampaignLink"`);

    await queryRunner.query(
      `DROP INDEX "core"."IDX_EMAILING_DOMAIN_CLICK_TRACKING_HOSTNAME"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."emailingDomain"
         DROP COLUMN "clickTrackingHostnameStatus",
         DROP COLUMN "clickTrackingHostnameId",
         DROP COLUMN "clickTrackingHostname",
         DROP COLUMN "clickTrackingEnabled"`,
    );

    await queryRunner.query(
      `DROP TYPE "core"."emailingDomain_clicktrackinghostnamestatus_enum"`,
    );
  }
}
