import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Runs after the inbox tables exist, since the constraint points at them.
@RegisteredInstanceCommand('2.42.0', 1789750620000)
export class AddMessageChannelDefaultInboxQueueFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."messageChannel"
        ADD COLUMN IF NOT EXISTS "defaultInboxQueueId" uuid`,
    );

    // Dropped first because Postgres has no ADD CONSTRAINT IF NOT EXISTS, and
    // this command has to survive being re-run.
    await queryRunner.query(
      `ALTER TABLE "core"."messageChannel"
        DROP CONSTRAINT IF EXISTS "FK_MESSAGE_CHANNEL_DEFAULT_INBOX_QUEUE_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageChannel"
        ADD CONSTRAINT "FK_MESSAGE_CHANNEL_DEFAULT_INBOX_QUEUE_ID"
        FOREIGN KEY ("defaultInboxQueueId")
        REFERENCES "core"."inboxQueue"("id") ON DELETE SET NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_MESSAGE_CHANNEL_DEFAULT_INBOX_QUEUE_ID"
        ON "core"."messageChannel" ("defaultInboxQueueId")
        WHERE "defaultInboxQueueId" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_MESSAGE_CHANNEL_DEFAULT_INBOX_QUEUE_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageChannel"
        DROP CONSTRAINT IF EXISTS "FK_MESSAGE_CHANNEL_DEFAULT_INBOX_QUEUE_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageChannel"
        DROP COLUMN IF EXISTS "defaultInboxQueueId"`,
    );
  }
}
