import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// appToken user/workspace FKs cascade on delete but were never indexed, so
// user and workspace deletions sequential-scan the whole table, and the new
// session cleanup job scans it again by type and expiry on every run.
const APP_TOKEN_INDEXES = [
  { name: 'IDX_APP_TOKEN_USER_ID', columns: '"userId"' },
  { name: 'IDX_APP_TOKEN_WORKSPACE_ID', columns: '"workspaceId"' },
  { name: 'IDX_APP_TOKEN_TYPE_EXPIRES_AT', columns: '"type", "expiresAt"' },
  { name: 'IDX_APP_TOKEN_TYPE_REVOKED_AT', columns: '"type", "revokedAt"' },
];

@RegisteredInstanceCommand('2.27.0', 1785518325511, { type: 'slow' })
export class CreateUserSessionCoreTableSlowInstanceCommand
  implements SlowInstanceCommand
{
  // core.appToken is populated on every login and has never been pruned, so
  // an ordinary CREATE INDEX would hold a write lock for the whole build and
  // stall sign-ins mid-upgrade. CONCURRENTLY cannot run inside a transaction,
  // which is why these live here rather than in up().
  public async runDataMigration(dataSource: DataSource): Promise<void> {
    for (const { name, columns } of APP_TOKEN_INDEXES) {
      // A CONCURRENTLY build that fails leaves an invalid index behind, which
      // IF NOT EXISTS would then skip forever. Dropping first keeps a retry
      // of a failed upgrade able to actually rebuild it.
      await dataSource.query(`DROP INDEX IF EXISTS "core"."${name}"`);
      await dataSource.query(
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS "${name}" ON "core"."appToken" (${columns})`,
      );
    }
  }

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

    // The userSession indexes stay in the transaction: the table is created
    // empty in the same step, so there is nothing to lock or scan.
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

    // No-ops when runDataMigration already built these concurrently. It is
    // skipped on an instance with no workspaces, though, and AppTokenEntity
    // declares the indexes, so without this the schema would drift from the
    // entity. An instance with no workspaces has no logins, hence no appToken
    // rows to lock.
    for (const { name, columns } of APP_TOKEN_INDEXES) {
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS "${name}" ON "core"."appToken" (${columns})`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const { name } of APP_TOKEN_INDEXES) {
      await queryRunner.query(`DROP INDEX IF EXISTS "core"."${name}"`);
    }

    await queryRunner.query(`DROP TABLE IF EXISTS "core"."userSession"`);
  }
}
