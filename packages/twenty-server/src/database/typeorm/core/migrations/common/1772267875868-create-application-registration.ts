import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateApplicationRegistration1772267875868
  implements MigrationInterface
{
  name = 'CreateApplicationRegistration1772267875868';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "core"."applicationRegistration" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "universalIdentifier" uuid NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "logoUrl" text,
        "author" text,
        "oAuthClientId" text NOT NULL,
        "oAuthClientSecretHash" text,
        "oAuthRedirectUris" text[] NOT NULL DEFAULT '{}',
        "oAuthScopes" text[] NOT NULL DEFAULT '{}',
        "createdByUserId" uuid,
        "websiteUrl" text,
        "termsUrl" text,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_application_registration" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_APPLICATION_REGISTRATION_UNIVERSAL_IDENTIFIER_UNIQUE"
      ON "core"."applicationRegistration" ("universalIdentifier")
      WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_APPLICATION_REGISTRATION_OAUTH_CLIENT_ID_UNIQUE"
      ON "core"."applicationRegistration" ("oAuthClientId")
      WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_APPLICATION_REGISTRATION_CREATED_BY_USER_ID"
      ON "core"."applicationRegistration" ("createdByUserId")
    `);

    await queryRunner.query(`
      ALTER TABLE "core"."applicationRegistration"
      ADD CONSTRAINT "FK_d5aa70ce34f5b8e51e5b0deafc2"
      FOREIGN KEY ("createdByUserId") REFERENCES "core"."user"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "core"."applicationRegistrationVariable" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "key" text NOT NULL,
        "encryptedValue" text NOT NULL DEFAULT '',
        "description" text NOT NULL DEFAULT '',
        "isSecret" boolean NOT NULL DEFAULT true,
        "isRequired" boolean NOT NULL DEFAULT false,
        "applicationRegistrationId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_application_registration_variable" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_APP_REG_VAR_APP_REGISTRATION_ID"
      ON "core"."applicationRegistrationVariable" ("applicationRegistrationId")
    `);

    await queryRunner.query(`
      ALTER TABLE "core"."applicationRegistrationVariable"
      ADD CONSTRAINT "IDX_APP_REG_VAR_KEY_APP_REGISTRATION_ID_UNIQUE"
      UNIQUE ("key", "applicationRegistrationId")
    `);

    await queryRunner.query(`
      ALTER TABLE "core"."applicationRegistrationVariable"
      ADD CONSTRAINT "FK_067a6267789011853178a6ab57a"
      FOREIGN KEY ("applicationRegistrationId") REFERENCES "core"."applicationRegistration"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "applicationRegistrationId" uuid`,
    );

    await queryRunner.query(`
      ALTER TABLE "core"."application"
      ADD CONSTRAINT "FK_ca635da088fa8d5379ed268b55e"
      FOREIGN KEY ("applicationRegistrationId") REFERENCES "core"."applicationRegistration"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "FK_ca635da088fa8d5379ed268b55e"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "applicationRegistrationId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" DROP CONSTRAINT "FK_067a6267789011853178a6ab57a"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" DROP CONSTRAINT "IDX_APP_REG_VAR_KEY_APP_REGISTRATION_ID_UNIQUE"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_APP_REG_VAR_APP_REGISTRATION_ID"`,
    );

    await queryRunner.query(
      `DROP TABLE "core"."applicationRegistrationVariable"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP CONSTRAINT "FK_d5aa70ce34f5b8e51e5b0deafc2"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_APPLICATION_REGISTRATION_CREATED_BY_USER_ID"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_APPLICATION_REGISTRATION_OAUTH_CLIENT_ID_UNIQUE"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_APPLICATION_REGISTRATION_UNIVERSAL_IDENTIFIER_UNIQUE"`,
    );

    await queryRunner.query(`DROP TABLE "core"."applicationRegistration"`);
  }
}
