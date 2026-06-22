import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.15.0', 1782000000000)
export class AddConnectedAccountWebhookSubscriptionFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."connectedAccountWebhookSubscription_channeltype_enum" AS ENUM('messaging', 'calendar'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."connectedAccountWebhookSubscription_status_enum" AS ENUM('PENDING', 'ACTIVE', 'FAILED', 'EXPIRED'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."connectedAccountWebhookSubscription" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "connectedAccountId" uuid NOT NULL,
        "channelType" "core"."connectedAccountWebhookSubscription_channeltype_enum" NOT NULL,
        "messageChannelId" uuid,
        "calendarChannelId" uuid,
        "externalSubscriptionId" character varying,
        "externalResourceId" character varying,
        "clientState" character varying NOT NULL,
        "status" "core"."connectedAccountWebhookSubscription_status_enum" NOT NULL DEFAULT 'PENDING',
        "expiresAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_connectedAccountWebhookSubscription_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_WEBHOOK_SUBSCRIPTION_ACCOUNT_CHANNEL_TYPE" UNIQUE ("connectedAccountId", "channelType"),
        CONSTRAINT "FK_connectedAccountWebhookSubscription_workspaceId" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_connectedAccountWebhookSubscription_connectedAccountId" FOREIGN KEY ("connectedAccountId") REFERENCES "core"."connectedAccount"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_connectedAccountWebhookSubscription_messageChannelId" FOREIGN KEY ("messageChannelId") REFERENCES "core"."messageChannel"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_connectedAccountWebhookSubscription_calendarChannelId" FOREIGN KEY ("calendarChannelId") REFERENCES "core"."calendarChannel"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_WEBHOOK_SUBSCRIPTION_STATUS_EXPIRES_AT" ON "core"."connectedAccountWebhookSubscription" ("status", "expiresAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_WEBHOOK_SUBSCRIPTION_EXTERNAL_SUBSCRIPTION_ID" ON "core"."connectedAccountWebhookSubscription" ("externalSubscriptionId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_WEBHOOK_SUBSCRIPTION_EXTERNAL_SUBSCRIPTION_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_WEBHOOK_SUBSCRIPTION_STATUS_EXPIRES_AT"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "core"."connectedAccountWebhookSubscription"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."connectedAccountWebhookSubscription_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."connectedAccountWebhookSubscription_channeltype_enum"`,
    );
  }
}
