import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateApplicationRegistration1772000000000
  implements MigrationInterface
{
  name = 'CreateApplicationRegistration1772000000000';

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
        CONSTRAINT "PK_application_registration" PRIMARY KEY ("id"),
        CONSTRAINT "FK_application_registration_created_by_user" FOREIGN KEY ("createdByUserId") REFERENCES "core"."user"("id") ON DELETE SET NULL
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
        CONSTRAINT "PK_application_registration_variable" PRIMARY KEY ("id"),
        CONSTRAINT "FK_application_registration_variable_application_registration" FOREIGN KEY ("applicationRegistrationId") REFERENCES "core"."applicationRegistration"("id") ON DELETE CASCADE,
        CONSTRAINT "IDX_APPLICATION_REGISTRATION_VARIABLE_KEY_APPLICATION_REGISTRATION_ID_UNIQUE" UNIQUE ("key", "applicationRegistrationId")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_APPLICATION_REGISTRATION_VARIABLE_APPLICATION_REGISTRATION_ID"
      ON "core"."applicationRegistrationVariable" ("applicationRegistrationId")
    `);

    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "applicationRegistrationId" uuid`,
    );

    await queryRunner.query(`
      ALTER TABLE "core"."application"
      ADD CONSTRAINT "FK_application_application_registration"
      FOREIGN KEY ("applicationRegistrationId") REFERENCES "core"."applicationRegistration"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "FK_application_application_registration"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "applicationRegistrationId"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_APPLICATION_REGISTRATION_VARIABLE_APPLICATION_REGISTRATION_ID"`,
    );

    await queryRunner.query(
      `DROP TABLE "core"."applicationRegistrationVariable"`,
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
