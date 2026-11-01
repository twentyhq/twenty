import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// Copied rather than imported: this command must keep granting exactly this
// set whatever the runtime rule becomes later.
const EVERYONE_PRINCIPAL_ID = '5047ca8f-514a-4609-8ef4-1bb63f3084c5';

// A private workflow's runs were readable by anyone whose role could read
// runs. Runs are now private records whose grants mirror their core workflow's
// visibility. Grants are written before readability changes, so no run is
// unreadable in between, and a retry rewrites the same derived set.
@RegisteredWorkspaceCommand('2.44.0', 1790595877162)
@Command({
  name: 'upgrade:2-44:follow-workflow-visibility-on-runs',
  description:
    "Grant each workflow run its core workflow's visibility, then make runs private",
})
export class FollowWorkflowVisibilityOnRunsCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const workflowRunObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workflowRun.universalIdentifier
      ];
    const recordShareObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.recordShare.universalIdentifier
      ];

    if (!isDefined(workflowRunObject) || !isDefined(recordShareObject)) {
      this.logger.log(
        `Workflow run or record share objects missing for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would grant workflow runs their workflow's visibility and make them private for workspace ${workspaceId}`,
      );

      return;
    }

    await this.grantWorkflowRunVisibility(workspaceId);

    await this.setWorkflowRunReadability({
      workspaceId,
      workflowRunObjectMetadataId: workflowRunObject.id,
      readability: MetadataReadability.PRIVATE,
    });
  }

  async down({ workspaceId }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const workflowRunObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workflowRun.universalIdentifier
      ];

    if (!isDefined(workflowRunObject)) {
      return;
    }

    // The grants stay: they are inert once the objects are open again.
    await this.setWorkflowRunReadability({
      workspaceId,
      workflowRunObjectMetadataId: workflowRunObject.id,
      readability: MetadataReadability.OPEN,
    });
  }

  // Legacy column, still read by later upgrades
  private async setWorkflowRunReadability({
    workspaceId,
    workflowRunObjectMetadataId,
    readability,
  }: {
    workspaceId: string;
    workflowRunObjectMetadataId: string;
    readability: MetadataReadability;
  }): Promise<void> {
    await this.dataSource.query(
      `UPDATE core."objectMetadata"
        SET readability = $3, "readabilityParentFieldUniversalIdentifiers" = NULL
        WHERE "workspaceId" = $1 AND id = $2`,
      [workspaceId, workflowRunObjectMetadataId, readability],
    );
  }

  private async grantWorkflowRunVisibility(workspaceId: string): Promise<void> {
    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const parameters = [
      workspaceId,
      STANDARD_OBJECTS.workflowRun.universalIdentifier,
    ];

    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `DELETE FROM ${schemaName}."recordShare" share
         USING core."objectMetadata" metadata
         WHERE metadata.id = share."objectMetadataId"
           AND metadata."workspaceId" = $1
           AND metadata."universalIdentifier" = $2
           AND (
             share."sourceId" = share."recordId"
             OR share."rowCause" = 'APPLICATION'
             OR share."principalType" = 'EVERYONE'
           )`,
        parameters,
      );

      await manager.query(
        `INSERT INTO ${schemaName}."recordShare"
           ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
         SELECT metadata.id, run.id, '${EVERYONE_PRINCIPAL_ID}', 'EVERYONE', 'FULL', 'RULE', run.id
         FROM ${schemaName}."workflowRun" run
         JOIN core."objectMetadata" metadata ON metadata."workspaceId" = $1 AND metadata."universalIdentifier" = $2
         LEFT JOIN core."workflow" core_workflow ON core_workflow.id = run."coreWorkflowId"
           AND core_workflow."workspaceId" = $1
         WHERE core_workflow.id IS NULL
           OR core_workflow."visibility" = 'WORKSPACE'
           OR core_workflow."createdByUserWorkspaceId" IS NULL
         ON CONFLICT DO NOTHING`,
        parameters,
      );

      await manager.query(
        `INSERT INTO ${schemaName}."recordShare"
           ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
         SELECT metadata.id, run.id, member.id, 'WORKSPACE_MEMBER', 'FULL', 'OWNER', run.id
         FROM ${schemaName}."workflowRun" run
         JOIN core."objectMetadata" metadata ON metadata."workspaceId" = $1 AND metadata."universalIdentifier" = $2
         JOIN core."workflow" core_workflow ON core_workflow.id = run."coreWorkflowId"
           AND core_workflow."workspaceId" = $1
         JOIN core."userWorkspace" membership ON membership.id = core_workflow."createdByUserWorkspaceId"
           AND membership."workspaceId" = $1 AND membership."deletedAt" IS NULL
         JOIN ${schemaName}."workspaceMember" member ON member."userId" = membership."userId"
           AND member."deletedAt" IS NULL
         ON CONFLICT DO NOTHING`,
        parameters,
      );
    });
  }
}
