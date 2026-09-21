import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const CALENDAR_CHANNEL_WEBHOOK_SUBSCRIPTION_EXTERNAL_ID_INDEX_NAME =
  'IDX_CALENDAR_CHANNEL_WEBHOOK_SUBSCRIPTION_EXTERNAL_ID';
const MESSAGE_CHANNEL_WEBHOOK_SUBSCRIPTION_EXTERNAL_ID_INDEX_NAME =
  'IDX_MESSAGE_CHANNEL_WEBHOOK_SUBSCRIPTION_EXTERNAL_ID';

@RegisteredInstanceCommand('2.25.0', 1785173910915)
export class AddChannelWebhookSubscriptionExternalIdIndexesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "${CALENDAR_CHANNEL_WEBHOOK_SUBSCRIPTION_EXTERNAL_ID_INDEX_NAME}" ON "core"."calendarChannel" ("webhookSubscriptionExternalId") WHERE "webhookSubscriptionExternalId" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "${MESSAGE_CHANNEL_WEBHOOK_SUBSCRIPTION_EXTERNAL_ID_INDEX_NAME}" ON "core"."messageChannel" ("webhookSubscriptionExternalId") WHERE "webhookSubscriptionExternalId" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."${MESSAGE_CHANNEL_WEBHOOK_SUBSCRIPTION_EXTERNAL_ID_INDEX_NAME}"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."${CALENDAR_CHANNEL_WEBHOOK_SUBSCRIPTION_EXTERNAL_ID_INDEX_NAME}"`,
    );
  }
}
