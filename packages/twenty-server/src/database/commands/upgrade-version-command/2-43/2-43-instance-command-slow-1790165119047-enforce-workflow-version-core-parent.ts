import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredInstanceCommand('2.43.0', 1790165119047, { type: 'slow' })
export class EnforceWorkflowVersionCoreParentSlowInstanceCommand implements SlowInstanceCommand {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  public async runDataMigration(dataSource: DataSource): Promise<void> {
    const workspaces = (await dataSource.query(
      `SELECT DISTINCT "workspaceId" FROM "core"."workflowVersion" WHERE "coreWorkflowId" IS NULL`,
    )) as { workspaceId: string }[];

    for (const { workspaceId } of workspaces) {
      await dataSource.query(
        `UPDATE "core"."workflowVersion" version
         SET "coreWorkflowId" = parent."id"
         FROM (
           SELECT DISTINCT ON ("workspaceWorkflowId") "workspaceWorkflowId", "id"
           FROM "core"."workflow"
           WHERE "workspaceId" = $1 AND "workspaceWorkflowId" IS NOT NULL
           ORDER BY "workspaceWorkflowId", "createdAt" ASC, "id" ASC
         ) parent
         WHERE version."workspaceId" = $1
           AND version."coreWorkflowId" IS NULL
           AND version."workflowId" = parent."workspaceWorkflowId"`,
        [workspaceId],
      );

      await dataSource.query(
        `DELETE FROM "core"."workflowVersion" WHERE "workspaceId" = $1 AND "coreWorkflowId" IS NULL`,
        [workspaceId],
      );

      await this.workspaceCacheService.flush(workspaceId, [
        'flatWorkflowVersionMaps',
        'workflowAutomatedTriggerMaps',
      ]);
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workflowVersion" ALTER COLUMN "coreWorkflowId" SET NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_WORKFLOW_VERSION_ONE_ACTIVE_PER_WORKFLOW"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_WORKFLOW_VERSION_ONE_ACTIVE_PER_WORKFLOW" ON "core"."workflowVersion" ("workspaceId", "coreWorkflowId") WHERE "status" = 'ACTIVE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_WORKFLOW_VERSION_ONE_ACTIVE_PER_WORKFLOW"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_WORKFLOW_VERSION_ONE_ACTIVE_PER_WORKFLOW" ON "core"."workflowVersion" ("workspaceId", "workflowId") WHERE "status" = 'ACTIVE'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workflowVersion" ALTER COLUMN "coreWorkflowId" DROP NOT NULL`,
    );
  }
}
