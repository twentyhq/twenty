import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.27.0', 1785518325511)
export class CreateUserSessionCoreTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."userSession" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tokenHash" text NOT NULL,
        "userId" uuid NOT NULL,
        "workspaceId" uuid,
        "userWorkspaceId" uuid,
        "authProvider" text NOT NULL,
        "isImpersonating" boolean NOT NULL DEFAULT false,
        "impersonatorUserWorkspaceId" uuid,
        "impersonatedUserWorkspaceId" uuid,
        "userAgent" text,
        "ipAddress" text,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "lastActiveAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "revokedAt" TIMESTAMP WITH TIME ZONE,
        "revokedReason" text,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_userSession_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_USER_SESSION_USER_ID" FOREIGN KEY ("userId")
          REFERENCES "core"."user"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_USER_SESSION_WORKSPACE_ID" FOREIGN KEY ("workspaceId")
          REFERENCES "core"."workspace"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_USER_SESSION_TOKEN_HASH_UNIQUE" ON "core"."userSession" ("tokenHash")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_USER_SESSION_USER_ID" ON "core"."userSession" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_USER_SESSION_WORKSPACE_ID" ON "core"."userSession" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_USER_SESSION_EXPIRES_AT" ON "core"."userSession" ("expiresAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_USER_SESSION_REVOKED_AT" ON "core"."userSession" ("revokedAt")`,
    );

    // appToken user/workspace FKs cascade on delete but were never indexed,
    // so user and workspace deletions sequential-scan the whole table.
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_APP_TOKEN_USER_ID" ON "core"."appToken" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_APP_TOKEN_WORKSPACE_ID" ON "core"."appToken" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_APP_TOKEN_TYPE_EXPIRES_AT" ON "core"."appToken" ("type", "expiresAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_APP_TOKEN_TYPE_REVOKED_AT" ON "core"."appToken" ("type", "revokedAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_APP_TOKEN_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_APP_TOKEN_TYPE_EXPIRES_AT"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_APP_TOKEN_TYPE_REVOKED_AT"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_APP_TOKEN_USER_ID"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."userSession"`);
  }
}
