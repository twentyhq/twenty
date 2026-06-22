import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.15.0', 1782143375974)
export class CreateApplicationRegistrationLogicFunctionCoreTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."applicationRegistrationLogicFunction" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "universalIdentifier" uuid NOT NULL,
        "name" text NOT NULL,
        "serverWebhookTriggerSettings" jsonb,
        "serverCronTriggerSettings" jsonb,
        "disabledAt" TIMESTAMP WITH TIME ZONE,
        "applicationRegistrationId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "IDX_APP_REG_LOGIC_FN_UID_APP_REGISTRATION_ID_UNIQUE" UNIQUE ("universalIdentifier", "applicationRegistrationId"),
        CONSTRAINT "PK_applicationRegistrationLogicFunction_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_appRegLogicFn_applicationRegistrationId" FOREIGN KEY ("applicationRegistrationId")
          REFERENCES "core"."applicationRegistration"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_APP_REG_LOGIC_FN_APP_REGISTRATION_ID"
        ON "core"."applicationRegistrationLogicFunction" ("applicationRegistrationId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_APP_REG_LOGIC_FN_APP_REGISTRATION_ID"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "core"."applicationRegistrationLogicFunction"`,
    );
  }
}
