import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddInboundWebhookSubscription1778500000000
  implements MigrationInterface
{
  name = 'AddInboundWebhookSubscription1778500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."inboundWebhookSubscription" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "source" varchar NOT NULL,
        "connectedAccountId" uuid,
        "externalSubscriptionId" varchar,
        "externalResourceId" varchar,
        "secret" varchar NOT NULL,
        "expiresAt" TIMESTAMP WITH TIME ZONE,
        "lastNotificationAt" TIMESTAMP WITH TIME ZONE,
        "metadata" jsonb,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inboundWebhookSubscription_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_INBOUND_WEBHOOK_SUBSCRIPTION_WORKSPACE_ID" ON "core"."inboundWebhookSubscription" ("workspaceId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_INBOUND_WEBHOOK_SUBSCRIPTION_SOURCE" ON "core"."inboundWebhookSubscription" ("source")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_INBOUND_WEBHOOK_SUBSCRIPTION_EXTERNAL_ID" ON "core"."inboundWebhookSubscription" ("externalSubscriptionId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_INBOUND_WEBHOOK_SUBSCRIPTION_EXPIRES_AT" ON "core"."inboundWebhookSubscription" ("expiresAt")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."inboundWebhookSubscription"
       ADD CONSTRAINT "FK_inboundWebhookSubscription_workspaceId"
       FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."inboundWebhookSubscription" DROP CONSTRAINT "FK_inboundWebhookSubscription_workspaceId"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_INBOUND_WEBHOOK_SUBSCRIPTION_EXPIRES_AT"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_INBOUND_WEBHOOK_SUBSCRIPTION_EXTERNAL_ID"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_INBOUND_WEBHOOK_SUBSCRIPTION_SOURCE"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_INBOUND_WEBHOOK_SUBSCRIPTION_WORKSPACE_ID"`,
    );

    await queryRunner.query(`DROP TABLE "core"."inboundWebhookSubscription"`);
  }
}
