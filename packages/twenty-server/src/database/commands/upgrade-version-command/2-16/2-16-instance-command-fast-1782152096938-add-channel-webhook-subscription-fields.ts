import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.16.0', 1782152096938)
export class AddChannelWebhookSubscriptionFieldsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."calendarChannel" ADD "webhookSubscriptionExternalId" character varying');
    await queryRunner.query('ALTER TABLE "core"."calendarChannel" ADD "webhookSubscriptionExternalResourceId" character varying');
    await queryRunner.query('ALTER TABLE "core"."calendarChannel" ADD "webhookSubscriptionClientState" character varying');
    await queryRunner.query('CREATE TYPE "core"."calendarChannel_webhooksubscriptionstatus_enum" AS ENUM(\'PENDING\', \'ACTIVE\', \'FAILED\', \'EXPIRED\')');
    await queryRunner.query('ALTER TABLE "core"."calendarChannel" ADD "webhookSubscriptionStatus" "core"."calendarChannel_webhooksubscriptionstatus_enum"');
    await queryRunner.query('ALTER TABLE "core"."calendarChannel" ADD "webhookSubscriptionExpiresAt" TIMESTAMP WITH TIME ZONE');
    await queryRunner.query('ALTER TABLE "core"."messageChannel" ADD "webhookSubscriptionExternalId" character varying');
    await queryRunner.query('ALTER TABLE "core"."messageChannel" ADD "webhookSubscriptionClientState" character varying');
    await queryRunner.query('CREATE TYPE "core"."messageChannel_webhooksubscriptionstatus_enum" AS ENUM(\'PENDING\', \'ACTIVE\', \'FAILED\', \'EXPIRED\')');
    await queryRunner.query('ALTER TABLE "core"."messageChannel" ADD "webhookSubscriptionStatus" "core"."messageChannel_webhooksubscriptionstatus_enum"');
    await queryRunner.query('ALTER TABLE "core"."messageChannel" ADD "webhookSubscriptionExpiresAt" TIMESTAMP WITH TIME ZONE');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."messageChannel" DROP COLUMN "webhookSubscriptionExpiresAt"');
    await queryRunner.query('ALTER TABLE "core"."messageChannel" DROP COLUMN "webhookSubscriptionStatus"');
    await queryRunner.query('DROP TYPE "core"."messageChannel_webhooksubscriptionstatus_enum"');
    await queryRunner.query('ALTER TABLE "core"."messageChannel" DROP COLUMN "webhookSubscriptionClientState"');
    await queryRunner.query('ALTER TABLE "core"."messageChannel" DROP COLUMN "webhookSubscriptionExternalId"');
    await queryRunner.query('ALTER TABLE "core"."calendarChannel" DROP COLUMN "webhookSubscriptionExpiresAt"');
    await queryRunner.query('ALTER TABLE "core"."calendarChannel" DROP COLUMN "webhookSubscriptionStatus"');
    await queryRunner.query('DROP TYPE "core"."calendarChannel_webhooksubscriptionstatus_enum"');
    await queryRunner.query('ALTER TABLE "core"."calendarChannel" DROP COLUMN "webhookSubscriptionClientState"');
    await queryRunner.query('ALTER TABLE "core"."calendarChannel" DROP COLUMN "webhookSubscriptionExternalResourceId"');
    await queryRunner.query('ALTER TABLE "core"."calendarChannel" DROP COLUMN "webhookSubscriptionExternalId"');
  }
}
