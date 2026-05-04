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
      `CREATE INDEX "IDX_APP_OAUTH_PROVIDER_APPLICATION_ID" ON "core"."applicationOAuthProvider" ("applicationId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_APP_OAUTH_PROVIDER_WORKSPACE_ID" ON "core"."applicationOAuthProvider" ("workspaceId")`,
    );

    // FK constraint names match the hashes that TypeORM auto-generates from
    // the @ManyToOne decorators in the entities. Keeping them in sync here
    // avoids a "pending migration" diff on every CI run.
    await queryRunner.query(
      `ALTER TABLE "core"."applicationOAuthProvider"
       ADD CONSTRAINT "FK_c63de8b90514de1798876c30f2e"
       FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."applicationOAuthProvider"
       ADD CONSTRAINT "FK_2d01320998547c2f5059d8b09d6"
       FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount"
       ADD COLUMN "applicationOAuthProviderId" uuid,
       ADD COLUMN "applicationId" uuid,
       ADD COLUMN "name" varchar,
       ADD COLUMN "visibility" varchar NOT NULL DEFAULT 'user'`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_CONNECTED_ACCOUNT_APP_OAUTH_PROVIDER_ID" ON "core"."connectedAccount" ("applicationOAuthProviderId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_CONNECTED_ACCOUNT_APPLICATION_ID" ON "core"."connectedAccount" ("applicationId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount"
       ADD CONSTRAINT "FK_344a905bc2041c998d5b57f9bde"
       FOREIGN KEY ("applicationOAuthProviderId") REFERENCES "core"."applicationOAuthProvider"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount"
       ADD CONSTRAINT "FK_21b8e7d3a21ff5712c4dd4875ac"
       FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount" DROP CONSTRAINT "FK_21b8e7d3a21ff5712c4dd4875ac"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount" DROP CONSTRAINT "FK_344a905bc2041c998d5b57f9bde"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_CONNECTED_ACCOUNT_APPLICATION_ID"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_CONNECTED_ACCOUNT_APP_OAUTH_PROVIDER_ID"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount"
       DROP COLUMN "visibility",
       DROP COLUMN "name",
       DROP COLUMN "applicationId",
       DROP COLUMN "applicationOAuthProviderId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."applicationOAuthProvider" DROP CONSTRAINT "FK_2d01320998547c2f5059d8b09d6"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."applicationOAuthProvider" DROP CONSTRAINT "FK_c63de8b90514de1798876c30f2e"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_APP_OAUTH_PROVIDER_WORKSPACE_ID"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_APP_OAUTH_PROVIDER_APPLICATION_ID"`,
    );

    await queryRunner.query(`DROP TABLE "core"."applicationOAuthProvider"`);
  }
}
