import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

// Connected accounts whose userWorkspace was hard-deleted (member removed
// before ownership transfer existed) keep syncing and crash contact-creation
// jobs. Mirrors ConnectedAccountMetadataService.transferOwnership in SQL.
@RegisteredInstanceCommand('2.32.0', 1786627111829, { type: 'slow' })
export class ArchiveOrphanedConnectedAccountsSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.transaction(async (entityManager) => {
      const orphanedConnectedAccounts: { id: string }[] =
        await entityManager.query(
          `SELECT ca."id"
           FROM "core"."connectedAccount" ca
           WHERE NOT EXISTS (
             SELECT 1
             FROM "core"."userWorkspace" uw
             WHERE uw."id" = ca."userWorkspaceId"
           )`,
        );

      if (orphanedConnectedAccounts.length === 0) {
        return;
      }

      const orphanedConnectedAccountIds = orphanedConnectedAccounts.map(
        ({ id }) => id,
      );

      await entityManager.query(
        `WITH custodian AS (
           SELECT DISTINCT ON (uw."workspaceId")
             uw."workspaceId",
             uw."id" AS "custodianUserWorkspaceId"
           FROM "core"."userWorkspace" uw
           WHERE uw."deletedAt" IS NULL
           ORDER BY
             uw."workspaceId",
             (NOT EXISTS (
               SELECT 1
               FROM "core"."roleTarget" rt
               JOIN "core"."role" r ON r."id" = rt."roleId"
               WHERE rt."userWorkspaceId" = uw."id"
                 AND r."universalIdentifier" = $1
             )),
             uw."createdAt"
         )
         UPDATE "core"."connectedAccount" ca
         SET "userWorkspaceId" = custodian."custodianUserWorkspaceId",
             "accessToken" = NULL,
             "refreshToken" = NULL,
             "connectionParameters" = NULL,
             "archivedAt" = COALESCE(ca."archivedAt", NOW())
         FROM custodian
         WHERE custodian."workspaceId" = ca."workspaceId"
           AND ca."id" = ANY($2::uuid[])`,
        [STANDARD_ROLE.admin.universalIdentifier, orphanedConnectedAccountIds],
      );

      await entityManager.query(
        `UPDATE "core"."messageChannel"
         SET "isSyncEnabled" = false
         WHERE "connectedAccountId" = ANY($1::uuid[])
           AND "isSyncEnabled" = true`,
        [orphanedConnectedAccountIds],
      );

      await entityManager.query(
        `UPDATE "core"."calendarChannel"
         SET "isSyncEnabled" = false
         WHERE "connectedAccountId" = ANY($1::uuid[])
           AND "isSyncEnabled" = true`,
        [orphanedConnectedAccountIds],
      );
    });
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
