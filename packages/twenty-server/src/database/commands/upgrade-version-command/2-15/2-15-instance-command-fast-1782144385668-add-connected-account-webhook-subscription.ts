import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.15.0', 1782144385668)
export class AddConnectedAccountWebhookSubscriptionFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "core"."connectedAccountWebhookSubscription_channeltype_enum" AS ENUM(\'messaging\', \'calendar\')');
    await queryRunner.query('CREATE TYPE "core"."connectedAccountWebhookSubscription_status_enum" AS ENUM(\'PENDING\', \'ACTIVE\', \'FAILED\', \'EXPIRED\')');
    await queryRunner.query('CREATE TABLE "core"."connectedAccountWebhookSubscription" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "connectedAccountId" uuid NOT NULL, "channelType" "core"."connectedAccountWebhookSubscription_channeltype_enum" NOT NULL, "messageChannelId" uuid, "calendarChannelId" uuid, "externalSubscriptionId" character varying, "externalResourceId" character varying, "clientState" character varying NOT NULL, "status" "core"."connectedAccountWebhookSubscription_status_enum" NOT NULL DEFAULT \'PENDING\', "expiresAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_WEBHOOK_SUBSCRIPTION_ACCOUNT_CHANNEL_TYPE" UNIQUE ("connectedAccountId", "channelType"), CONSTRAINT "PK_232ba1d35067f64aa268972a422" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_WEBHOOK_SUBSCRIPTION_WORKSPACE_CALENDAR_CHANNEL" ON "core"."connectedAccountWebhookSubscription" ("workspaceId", "calendarChannelId") ');
    await queryRunner.query('CREATE INDEX "IDX_WEBHOOK_SUBSCRIPTION_WORKSPACE_MESSAGE_CHANNEL" ON "core"."connectedAccountWebhookSubscription" ("workspaceId", "messageChannelId") ');
    await queryRunner.query('CREATE INDEX "IDX_WEBHOOK_SUBSCRIPTION_EXTERNAL_SUBSCRIPTION_ID" ON "core"."connectedAccountWebhookSubscription" ("externalSubscriptionId") ');
    await queryRunner.query('CREATE INDEX "IDX_WEBHOOK_SUBSCRIPTION_STATUS_EXPIRES_AT" ON "core"."connectedAccountWebhookSubscription" ("status", "expiresAt") ');
    await queryRunner.query('ALTER TABLE "core"."connectedAccountWebhookSubscription" ADD CONSTRAINT "FK_f916f0908e25bd1dd950458c447" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."connectedAccountWebhookSubscription" ADD CONSTRAINT "FK_faaa0eeec4da1c0067103b48598" FOREIGN KEY ("connectedAccountId") REFERENCES "core"."connectedAccount"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."connectedAccountWebhookSubscription" ADD CONSTRAINT "FK_7f11dfd6d556c700b5e36e36b57" FOREIGN KEY ("messageChannelId") REFERENCES "core"."messageChannel"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."connectedAccountWebhookSubscription" ADD CONSTRAINT "FK_2a8859eb99dbb641181cde2402d" FOREIGN KEY ("calendarChannelId") REFERENCES "core"."calendarChannel"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."connectedAccountWebhookSubscription" DROP CONSTRAINT "FK_2a8859eb99dbb641181cde2402d"');
    await queryRunner.query('ALTER TABLE "core"."connectedAccountWebhookSubscription" DROP CONSTRAINT "FK_7f11dfd6d556c700b5e36e36b57"');
    await queryRunner.query('ALTER TABLE "core"."connectedAccountWebhookSubscription" DROP CONSTRAINT "FK_faaa0eeec4da1c0067103b48598"');
    await queryRunner.query('ALTER TABLE "core"."connectedAccountWebhookSubscription" DROP CONSTRAINT "FK_f916f0908e25bd1dd950458c447"');
    await queryRunner.query('DROP INDEX "core"."IDX_WEBHOOK_SUBSCRIPTION_STATUS_EXPIRES_AT"');
    await queryRunner.query('DROP INDEX "core"."IDX_WEBHOOK_SUBSCRIPTION_EXTERNAL_SUBSCRIPTION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_WEBHOOK_SUBSCRIPTION_WORKSPACE_MESSAGE_CHANNEL"');
    await queryRunner.query('DROP INDEX "core"."IDX_WEBHOOK_SUBSCRIPTION_WORKSPACE_CALENDAR_CHANNEL"');
    await queryRunner.query('DROP TABLE "core"."connectedAccountWebhookSubscription"');
    await queryRunner.query('DROP TYPE "core"."connectedAccountWebhookSubscription_status_enum"');
    await queryRunner.query('DROP TYPE "core"."connectedAccountWebhookSubscription_channeltype_enum"');
  }
}
