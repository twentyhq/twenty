import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredInstanceCommand('2.60.0', 1794926980299, { type: 'slow' })
export class AddWorkflowVersionCoreWorkflowForeignKeySlowInstanceCommand
  implements SlowInstanceCommand
{
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    const deletedRows = await dataSource.query<{ workspaceId: string }[]>(
      `DELETE FROM "core"."workflowVersion" "workflowVersion"
        WHERE NOT EXISTS (
          SELECT 1 FROM "core"."workflow" "workflow"
            WHERE "workflow"."id" = "workflowVersion"."coreWorkflowId"
        )
        RETURNING "workspaceId"`,
    );

    const affectedWorkspaceIds = new Set(
      deletedRows.map(({ workspaceId }) => workspaceId),
    );

    for (const workspaceId of affectedWorkspaceIds) {
      await this.workspaceCacheService.flush(workspaceId, [
        'flatWorkflowVersionMaps',
        'workflowAutomatedTriggerMaps',
      ]);
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workflowVersion" ADD CONSTRAINT "FK_a94dcf82da41ca8e07cc6d912a9" FOREIGN KEY ("coreWorkflowId") REFERENCES "core"."workflow"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workflowVersion" DROP CONSTRAINT "FK_a94dcf82da41ca8e07cc6d912a9"',
    );
  }
}
