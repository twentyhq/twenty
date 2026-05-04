import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.3.0', 1777896012579)
export class ConnectionProviderSyncableEntityFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop FK + index that pin connectedAccount to the old table.
    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount" DROP CONSTRAINT "FK_344a905bc2041c998d5b57f9bde"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_CONNECTED_ACCOUNT_APP_OAUTH_PROVIDER_ID"`,
    );

    // 2. Drop the old applicationOAuthProvider table (CASCADE clears its own
    //    constraints + dependent FKs). No production data to preserve.
    await queryRunner.query(
      `DROP TABLE "core"."applicationOAuthProvider" CASCADE`,
    );

    // 3. Rename the FK column on connectedAccount.
    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount" RENAME COLUMN "applicationOAuthProviderId" TO "connectionProviderId"`,
    );

    // 4. Create the new generic connectionProvider table. SyncableEntity adds
    //    the (workspaceId, universalIdentifier) unique index — no separate
    //    workspaceId-only index (would be redundant via leftmost prefix).
    await queryRunner.query(
      `CREATE TABLE "core"."connectionProvider" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "applicationId" uuid NOT NULL,
        "universalIdentifier" uuid NOT NULL,
        "name" varchar NOT NULL,
        "displayName" varchar NOT NULL,
        "type" varchar NOT NULL,
        "oauthConfig" jsonb,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "IDX_CONNECTION_PROVIDER_NAME_APPLICATION_UNIQUE" UNIQUE ("name", "applicationId"),
        CONSTRAINT "PK_connectionProvider_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_CONNECTION_PROVIDER_APPLICATION_ID" ON "core"."connectionProvider" ("applicationId")`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_44a4fc17a91603c38daabfd4d8" ON "core"."connectionProvider" ("workspaceId", "universalIdentifier")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."connectionProvider"
       ADD CONSTRAINT "FK_16d8e4d029dd986268d759a2257"
       FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."connectionProvider"
       ADD CONSTRAINT "FK_a2553b431536a5b93211012f984"
       FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // 5. Wire connectedAccount's renamed FK column to the new table.
    await queryRunner.query(
      `CREATE INDEX "IDX_CONNECTED_ACCOUNT_CONNECTION_PROVIDER_ID" ON "core"."connectedAccount" ("connectionProviderId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount"
       ADD CONSTRAINT "FK_40de45e67a285dafb84e510cdc6"
       FOREIGN KEY ("connectionProviderId") REFERENCES "core"."connectionProvider"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount" DROP CONSTRAINT "FK_40de45e67a285dafb84e510cdc6"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_CONNECTED_ACCOUNT_CONNECTION_PROVIDER_ID"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."connectionProvider" DROP CONSTRAINT "FK_a2553b431536a5b93211012f984"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."connectionProvider" DROP CONSTRAINT "FK_16d8e4d029dd986268d759a2257"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_44a4fc17a91603c38daabfd4d8"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_CONNECTION_PROVIDER_APPLICATION_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."connectionProvider"`);

    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount" RENAME COLUMN "connectionProviderId" TO "applicationOAuthProviderId"`,
    );

    // Recreate the original applicationOAuthProvider table (mirrors the
    // PR #20181 migration so a `migrate down` cleanly restores main).
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
      `CREATE INDEX "IDX_CONNECTED_ACCOUNT_APP_OAUTH_PROVIDER_ID" ON "core"."connectedAccount" ("applicationOAuthProviderId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount"
       ADD CONSTRAINT "FK_344a905bc2041c998d5b57f9bde"
       FOREIGN KEY ("applicationOAuthProviderId") REFERENCES "core"."applicationOAuthProvider"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
