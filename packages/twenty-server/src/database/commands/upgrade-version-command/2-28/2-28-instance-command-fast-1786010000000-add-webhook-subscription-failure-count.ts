import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.28.0', 1786010000000)
export class AddWebhookSubscriptionFailureCountFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."calendarChannel" ADD "webhookSubscriptionFailureCount" integer NOT NULL DEFAULT \'0\'');
    await queryRunner.query('ALTER TABLE "core"."messageChannel" ADD "webhookSubscriptionFailureCount" integer NOT NULL DEFAULT \'0\'');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."messageChannel" DROP COLUMN "webhookSubscriptionFailureCount"');
    await queryRunner.query('ALTER TABLE "core"."calendarChannel" DROP COLUMN "webhookSubscriptionFailureCount"');
  }
}
