import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// Copied rather than imported so the restored rows stay the ones 2-44 wrote
const EVERYONE_PRINCIPAL_ID = '5047ca8f-514a-4609-8ef4-1bb63f3084c5';

// Runs of a workspace-visible workflow are now admitted by a sharing rule
// evaluated at read time, so the rows 2-44 materialized for it are dropped
@RegisteredWorkspaceCommand('2.45.0', 1790876879146)
@Command({
  name: 'upgrade:2-45:drop-workflow-run-rule-record-shares',
  description:
    'Drop the record shares that granted everyone the runs of workspace-visible workflows',
})
export class DropWorkflowRunRuleRecordSharesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    if (!(await this.hasWorkflowRunRecordShares(workspaceId))) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: dropping the workflow run rule record shares`,
    );

    if (options.dryRun) {
      return;
    }

    await this.dataSource.query(
      `DELETE FROM ${this.buildRecordShareTable(workspaceId)} share
       USING core."objectMetadata" metadata
       WHERE metadata.id = share."objectMetadataId"
         AND metadata."workspaceId" = $1
         AND metadata."universalIdentifier" = $2
         AND share."rowCause" = 'RULE'
         AND share."principalType" = 'EVERYONE'`,
      [workspaceId, STANDARD_OBJECTS.workflowRun.universalIdentifier],
    );
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    if (!(await this.hasWorkflowRunRecordShares(workspaceId))) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: restoring the workflow run rule record shares`,
    );

    if (options.dryRun) {
      return;
    }

    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

    await this.dataSource.query(
      `INSERT INTO ${this.buildRecordShareTable(workspaceId)}
         ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
       SELECT metadata.id, run.id, $3::uuid, 'EVERYONE', 'FULL', 'RULE', run.id
       FROM ${schemaName}."workflowRun" run
       JOIN core."objectMetadata" metadata ON metadata."workspaceId" = $1 AND metadata."universalIdentifier" = $2
       LEFT JOIN core."workflow" core_workflow ON core_workflow.id = run."coreWorkflowId"
         AND core_workflow."workspaceId" = $1
       WHERE core_workflow.id IS NULL
         OR core_workflow."visibility" = 'WORKSPACE'
         OR core_workflow."createdByUserWorkspaceId" IS NULL
       ON CONFLICT DO NOTHING`,
      [
        workspaceId,
        STANDARD_OBJECTS.workflowRun.universalIdentifier,
        EVERYONE_PRINCIPAL_ID,
      ],
    );
  }

  private async hasWorkflowRunRecordShares(
    workspaceId: string,
  ): Promise<boolean> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    return (
      isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.workflowRun.universalIdentifier
        ],
      ) &&
      isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.recordShare.universalIdentifier
        ],
      )
    );
  }

  private buildRecordShareTable(workspaceId: string): string {
    return `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."recordShare"`;
  }
}
