import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddApplicationOAuthProviderAndConnectedAccountColumn1777558657640
  implements MigrationInterface
{
  name = 'AddApplicationOAuthProviderAndConnectedAccountColumn1777558657640';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."applicationOAuthProvider" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "applicationId" uuid NOT NULL,
        "universalIdentifier" uuid NOT NULL,
        "name" varchar NOT NULL,
        "displayName" varchar NOT NULL,
        "icon" varchar,
        "authorizationEndpoint" varchar NOT NULL,
        "tokenEndpoint" varchar NOT NULL,
        "revokeEndpoint" varchar,
        "scopes" varchar array NOT NULL DEFAULT '{}',
        "clientIdVariable" varchar NOT NULL,
        "clientSecretVariable" varchar NOT NULL,
        "authorizationParams" jsonb,
        "tokenRequestContentType" varchar NOT NULL DEFAULT 'json',
        "usePkce" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "IDX_APP_OAUTH_PROVIDER_NAME_APPLICATION_UNIQUE" UNIQUE ("name", "applicationId"),
        CONSTRAINT "IDX_APP_OAUTH_PROVIDER_UNIVERSAL_ID_APPLICATION_UNIQUE" UNIQUE ("universalIdentifier", "applicationId"),
        CONSTRAINT "PK_applicationOAuthProvider_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_APP_OAUTH_PROVIDER_WORKSPACE_ID" ON "core"."applicationOAuthProvider" ("workspaceId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."applicationOAuthProvider"
       ADD CONSTRAINT "FK_applicationOAuthProvider_workspace"
       FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."applicationOAuthProvider"
       ADD CONSTRAINT "FK_applicationOAuthProvider_application"
       FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount"
       ADD COLUMN "applicationOAuthProviderId" uuid,
       ADD COLUMN "applicationId" uuid,
       ADD COLUMN "name" varchar,
       ADD COLUMN "scope" varchar NOT NULL DEFAULT 'user'`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_CONNECTED_ACCOUNT_APP_OAUTH_PROVIDER_ID" ON "core"."connectedAccount" ("applicationOAuthProviderId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_CONNECTED_ACCOUNT_APPLICATION_ID" ON "core"."connectedAccount" ("applicationId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount"
       ADD CONSTRAINT "FK_connectedAccount_applicationOAuthProvider"
       FOREIGN KEY ("applicationOAuthProviderId") REFERENCES "core"."applicationOAuthProvider"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount"
       ADD CONSTRAINT "FK_connectedAccount_application"
       FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount" DROP CONSTRAINT "FK_connectedAccount_application"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount" DROP CONSTRAINT "FK_connectedAccount_applicationOAuthProvider"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_CONNECTED_ACCOUNT_APPLICATION_ID"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_CONNECTED_ACCOUNT_APP_OAUTH_PROVIDER_ID"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount"
       DROP COLUMN "scope",
       DROP COLUMN "name",
       DROP COLUMN "applicationId",
       DROP COLUMN "applicationOAuthProviderId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."applicationOAuthProvider" DROP CONSTRAINT "FK_applicationOAuthProvider_application"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."applicationOAuthProvider" DROP CONSTRAINT "FK_applicationOAuthProvider_workspace"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_APP_OAUTH_PROVIDER_WORKSPACE_ID"`,
    );

    await queryRunner.query(`DROP TABLE "core"."applicationOAuthProvider"`);
  }
}
