import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.15.0', 1782150179965)
export class CreateApplicationRegistrationLogicFunctionCoreTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."applicationRegistrationLogicFunction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "universalIdentifier" uuid NOT NULL, "name" text NOT NULL, "serverWebhookTriggerSettings" jsonb, "serverCronTriggerSettings" jsonb, "disabledAt" TIMESTAMP WITH TIME ZONE, "applicationRegistrationId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_127a178e73dc57b917808347b25" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_APP_REG_LOGIC_FN_APP_REGISTRATION_ID" ON "core"."applicationRegistrationLogicFunction" ("applicationRegistrationId") ');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_APP_REG_LOGIC_FN_UID_APP_REGISTRATION_ID_UNIQUE" ON "core"."applicationRegistrationLogicFunction" ("universalIdentifier", "applicationRegistrationId") WHERE "deletedAt" IS NULL');
    await queryRunner.query('ALTER TABLE "core"."applicationRegistrationLogicFunction" ADD CONSTRAINT "FK_a46aaceda1d4878815c8301b459" FOREIGN KEY ("applicationRegistrationId") REFERENCES "core"."applicationRegistration"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."applicationRegistrationLogicFunction" DROP CONSTRAINT "FK_a46aaceda1d4878815c8301b459"');
    await queryRunner.query('DROP INDEX "core"."IDX_APP_REG_LOGIC_FN_UID_APP_REGISTRATION_ID_UNIQUE"');
    await queryRunner.query('DROP INDEX "core"."IDX_APP_REG_LOGIC_FN_APP_REGISTRATION_ID"');
    await queryRunner.query('DROP TABLE "core"."applicationRegistrationLogicFunction"');
  }
}
