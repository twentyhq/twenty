import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.40.0', 1788985903000)
export class AddCampaignEngagementTrackingFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."emailingDomain_trackinghostnamestatus_enum" AS ENUM('PENDING', 'ACTIVE', 'FAILED')`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."emailingDomain"
         ADD "isClickTrackingEnabled" boolean NOT NULL DEFAULT false,
         ADD "isOpenTrackingEnabled" boolean NOT NULL DEFAULT false,
         ADD "trackingHostname" varchar,
         ADD "trackingHostnameId" varchar,
         ADD "trackingHostnameStatus" "core"."emailingDomain_trackinghostnamestatus_enum"`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_EMAILING_DOMAIN_TRACKING_HOSTNAME" ON "core"."emailingDomain" ("trackingHostname")`,
    );

    await queryRunner.query(
      `CREATE TABLE "core"."messageCampaignLink" (
         "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
         "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
         "workspaceId" uuid NOT NULL,
         "messageCampaignId" uuid NOT NULL,
         "authoredUrl" character varying NOT NULL,
         "url" character varying NOT NULL,
         "urlHash" character(64) NOT NULL,
         CONSTRAINT "PK_messageCampaignLink_id" PRIMARY KEY ("id"),
         CONSTRAINT "FK_messageCampaignLink_workspaceId" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION
       )`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_MESSAGE_CAMPAIGN_LINK_URL_UNIQUE" ON "core"."messageCampaignLink" ("workspaceId", "messageCampaignId", "urlHash")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_MESSAGE_CAMPAIGN_LINK_CAMPAIGN_ID" ON "core"."messageCampaignLink" ("workspaceId", "messageCampaignId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "core"."messageCampaignLink"`);

    await queryRunner.query(
      `DROP INDEX "core"."IDX_EMAILING_DOMAIN_TRACKING_HOSTNAME"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."emailingDomain"
         DROP COLUMN "trackingHostnameStatus",
         DROP COLUMN "trackingHostnameId",
         DROP COLUMN "trackingHostname",
         DROP COLUMN "isOpenTrackingEnabled",
         DROP COLUMN "isClickTrackingEnabled"`,
    );

    await queryRunner.query(
      `DROP TYPE "core"."emailingDomain_trackinghostnamestatus_enum"`,
    );
  }
}
