import { MigrationInterface, QueryRunner } from 'typeorm';

export class SsoMissingMigration1733318043626 implements MigrationInterface {
  name = 'SsoMissingMigration1733318043626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" DROP CONSTRAINT "FK_workspaceId"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."apptoken_unique_invitation_by_user_workspace"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."workspace_subdomain_unique_index"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" DROP CONSTRAINT "userIdIsNullWhenTypeIsInvitation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" DROP CONSTRAINT "userIdNotNullWhenTypeIsNotInvitation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" DROP CONSTRAINT "CHK_OIDC"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" DROP CONSTRAINT "CHK_SAML"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" DROP COLUMN "status"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."workspaceSSOIdentityProvider_status_enum" AS ENUM('Active', 'Inactive', 'Error')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" ADD "status" "core"."workspaceSSOIdentityProvider_status_enum" NOT NULL DEFAULT 'Active'`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."idp_type_enum" RENAME TO "idp_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."workspaceSSOIdentityProvider_type_enum" AS ENUM('OIDC', 'SAML')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" ALTER COLUMN "type" TYPE "core"."workspaceSSOIdentityProvider_type_enum" USING "type"::"text"::"core"."workspaceSSOIdentityProvider_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" ALTER COLUMN "type" SET DEFAULT 'OIDC'`,
    );
    await queryRunner.query(`DROP TYPE "core"."idp_type_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "core"."workspace_activationStatus_enum" RENAME TO "workspace_activationStatus_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."workspace_activationstatus_enum" AS ENUM('ONGOING_CREATION', 'PENDING_CREATION', 'ACTIVE', 'INACTIVE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" TYPE "core"."workspace_activationstatus_enum" USING "activationStatus"::"text"::"core"."workspace_activationstatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" SET DEFAULT 'INACTIVE'`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."workspace_activationStatus_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "isGoogleAuthEnabled" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "isPasswordAuthEnabled" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "isMicrosoftAuthEnabled" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" ADD CONSTRAINT "FK_bc8d8855198de1fbc32fba8df93" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" DROP CONSTRAINT "FK_bc8d8855198de1fbc32fba8df93"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "isMicrosoftAuthEnabled" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "isPasswordAuthEnabled" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "isGoogleAuthEnabled" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."workspace_activationStatus_enum_old" AS ENUM('PENDING_CREATION', 'ONGOING_CREATION', 'ACTIVE', 'INACTIVE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" TYPE "core"."workspace_activationStatus_enum_old" USING "activationStatus"::"text"::"core"."workspace_activationStatus_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" SET DEFAULT 'INACTIVE'`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."workspace_activationstatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."workspace_activationStatus_enum_old" RENAME TO "workspace_activationStatus_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."idp_type_enum_old" AS ENUM('OIDC', 'SAML')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" ALTER COLUMN "type" TYPE "core"."idp_type_enum_old" USING "type"::"text"::"core"."idp_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" ALTER COLUMN "type" SET DEFAULT 'OIDC'`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."workspaceSSOIdentityProvider_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."idp_type_enum_old" RENAME TO "idp_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" DROP COLUMN "status"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."workspaceSSOIdentityProvider_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" ADD "status" character varying NOT NULL DEFAULT 'Active'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" ALTER COLUMN "name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" ADD CONSTRAINT "CHK_SAML" CHECK ((((type = 'SAML'::core.idp_type_enum) AND ("ssoURL" IS NOT NULL) AND (certificate IS NOT NULL)) OR (type = 'OIDC'::core.idp_type_enum)))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" ADD CONSTRAINT "CHK_OIDC" CHECK ((((type = 'OIDC'::core.idp_type_enum) AND ("clientID" IS NOT NULL) AND ("clientSecret" IS NOT NULL)) OR (type = 'SAML'::core.idp_type_enum)))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" ADD CONSTRAINT "userIdNotNullWhenTypeIsNotInvitation" CHECK (((type = 'INVITATION_TOKEN'::text) OR ("userId" IS NOT NULL)))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" ADD CONSTRAINT "userIdIsNullWhenTypeIsInvitation" CHECK (((type <> 'INVITATION_TOKEN'::text) OR ("userId" IS NULL)))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "workspace_subdomain_unique_index" ON "core"."workspace" ("subdomain") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "apptoken_unique_invitation_by_user_workspace" ON "core"."appToken" ("workspaceId") WHERE (type = 'INVITATION_TOKEN'::text)`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" ADD CONSTRAINT "FK_workspaceId" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
