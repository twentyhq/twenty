/* @license Enterprise */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkspaceSSOIdentityProvider1727181198403
  implements MigrationInterface
{
  name = 'AddWorkspaceSSOIdentityProvider1727181198403';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "core"."idp_type_enum" AS ENUM('OIDC', 'SAML');
    `);

    await queryRunner.query(`
      CREATE TABLE "core"."workspaceSSOIdentityProvider" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "name" varchar NULL,
        "workspaceId" uuid NOT NULL,
        "createdAt" timestamptz DEFAULT now() NOT NULL,
        "updatedAt" timestamptz DEFAULT now() NOT NULL,
        "type" "core"."idp_type_enum" DEFAULT 'OIDC' NOT NULL,
        "issuer" varchar NOT NULL,
        "ssoURL" varchar NULL,
        "clientID" varchar NULL,
        "clientSecret" varchar NULL,
        "certificate" varchar NULL,
        "fingerprint" varchar NULL,
        "status" varchar DEFAULT 'Active' NOT NULL
      );
    `);

    await queryRunner.query(`
      ALTER TABLE "core"."workspaceSSOIdentityProvider"
      ADD CONSTRAINT "FK_workspaceId"
      FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id")
      ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE "core"."workspaceSSOIdentityProvider" ADD CONSTRAINT "CHK_OIDC" CHECK (
        ("type" = 'OIDC' AND "clientID" IS NOT NULL AND "clientSecret" IS NOT NULL) OR "type" = 'SAML'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "core"."workspaceSSOIdentityProvider" ADD CONSTRAINT "CHK_SAML" CHECK (
         ("type" = 'SAML' AND "ssoURL" IS NOT NULL AND "certificate" IS NOT NULL) OR "type" = 'OIDC'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "core"."workspaceSSOIdentityProvider"
      DROP CONSTRAINT "FK_workspaceId";
    `);

    await queryRunner.query(`
      DROP TABLE "core"."workspaceSSOIdentityProvider";
    `);

    await queryRunner.query(`
      DROP TYPE "core"."idp_type_enum";
    `);
  }
}
