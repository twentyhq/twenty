import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppRegistration1772000000000 implements MigrationInterface {
  name = 'CreateAppRegistration1772000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "core"."appRegistration" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "universalIdentifier" uuid NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "logoUrl" text,
        "author" text,
        "clientId" text NOT NULL,
        "clientSecretHash" text,
        "redirectUris" text[] NOT NULL DEFAULT '{}',
        "scopes" text[] NOT NULL DEFAULT '{}',
        "createdByUserId" uuid,
        "websiteUrl" text,
        "termsUrl" text,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_app_registration" PRIMARY KEY ("id"),
        CONSTRAINT "FK_app_registration_created_by_user" FOREIGN KEY ("createdByUserId") REFERENCES "core"."user"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_APP_REGISTRATION_UNIVERSAL_IDENTIFIER_UNIQUE"
      ON "core"."appRegistration" ("universalIdentifier")
      WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_APP_REGISTRATION_CLIENT_ID_UNIQUE"
      ON "core"."appRegistration" ("clientId")
      WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_APP_REGISTRATION_CREATED_BY_USER_ID"
      ON "core"."appRegistration" ("createdByUserId")
    `);

    await queryRunner.query(`
      CREATE TABLE "core"."appRegistrationVariable" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "key" text NOT NULL,
        "encryptedValue" text NOT NULL DEFAULT '',
        "description" text NOT NULL DEFAULT '',
        "isSecret" boolean NOT NULL DEFAULT true,
        "isRequired" boolean NOT NULL DEFAULT false,
        "appRegistrationId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_app_registration_variable" PRIMARY KEY ("id"),
        CONSTRAINT "FK_app_registration_variable_app_registration" FOREIGN KEY ("appRegistrationId") REFERENCES "core"."appRegistration"("id") ON DELETE CASCADE,
        CONSTRAINT "IDX_APP_REGISTRATION_VARIABLE_KEY_APP_REGISTRATION_ID_UNIQUE" UNIQUE ("key", "appRegistrationId")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_APP_REGISTRATION_VARIABLE_APP_REGISTRATION_ID"
      ON "core"."appRegistrationVariable" ("appRegistrationId")
    `);

    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "appRegistrationId" uuid`,
    );

    await queryRunner.query(`
      ALTER TABLE "core"."application"
      ADD CONSTRAINT "FK_application_app_registration"
      FOREIGN KEY ("appRegistrationId") REFERENCES "core"."appRegistration"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "FK_application_app_registration"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "appRegistrationId"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_APP_REGISTRATION_VARIABLE_APP_REGISTRATION_ID"`,
    );

    await queryRunner.query(
      `DROP TABLE "core"."appRegistrationVariable"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_APP_REGISTRATION_CREATED_BY_USER_ID"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_APP_REGISTRATION_CLIENT_ID_UNIQUE"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_APP_REGISTRATION_UNIVERSAL_IDENTIFIER_UNIQUE"`,
    );

    await queryRunner.query(`DROP TABLE "core"."appRegistration"`);
  }
}
