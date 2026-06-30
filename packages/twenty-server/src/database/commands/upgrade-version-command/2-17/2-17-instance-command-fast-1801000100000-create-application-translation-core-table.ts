import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.17.0', 1801000100000)
export class CreateApplicationTranslationCoreTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."applicationTranslation" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "applicationRegistrationId" uuid,
        "locale" text NOT NULL,
        "messages" jsonb NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_applicationTranslation_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_62da06a264eae9a1e84f6c611bd" FOREIGN KEY ("applicationRegistrationId") REFERENCES "core"."applicationRegistration"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_APPLICATION_TRANSLATION_REGISTRATION_LOCALE_UNIQUE"
        ON "core"."applicationTranslation" ("applicationRegistrationId", "locale")
        WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_APPLICATION_TRANSLATION_STANDARD_LOCALE_UNIQUE"
        ON "core"."applicationTranslation" ("locale")
        WHERE "deletedAt" IS NULL AND "applicationRegistrationId" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_APPLICATION_TRANSLATION_STANDARD_LOCALE_UNIQUE"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_APPLICATION_TRANSLATION_REGISTRATION_LOCALE_UNIQUE"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "core"."applicationTranslation"`,
    );
  }
}
