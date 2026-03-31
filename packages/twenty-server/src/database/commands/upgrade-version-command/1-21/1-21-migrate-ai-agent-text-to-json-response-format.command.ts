import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const TEXT_AGENT_DEFAULT_JSON_RESPONSE_FORMAT = {
  type: 'json' as const,
  schema: {
    type: 'object' as const,
    properties: {
      response: {
        type: 'string' as const,
        description: 'Response of the agent',
      },
    },
    required: ['response'],
    additionalProperties: false as const,
  },
};

const TEXT_AGENT_DEFAULT_OUTPUT_SCHEMA = {
  response: {
    isLeaf: true,
    type: 'string',
    label: 'Response',
    value: null,
  },
};

@Command({
  name: 'upgrade:1-21:migrate-ai-agent-text-to-json-response-format',
  description:
    'Migrate AI agents with text response format to JSON with a default response field',
})
export class MigrateAiAgentTextToJsonResponseFormatCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const textAgents = await this.findTextFormatAgents(workspaceId);

    if (textAgents.length === 0) {
      this.logger.log(
        `No text-format agents found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Found ${textAgents.length} text-format agent(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const textAgentIds = textAgents.map(
      (agent: { id: string }) => agent.id,
    );

    await this.migrateAgentsToJson(textAgentIds);

    await this.updateWorkflowStepOutputSchemas(workspaceId, textAgentIds);
    await this.invalidateCaches(workspaceId);

    this.logger.log(
      `Successfully migrated ${textAgents.length} agent(s) to JSON response format for workspace ${workspaceId}`,
    );
  }

  private async findTextFormatAgents(
    workspaceId: string,
  ): Promise<{ id: string }[]> {
    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      return await queryRunner.query(
        `SELECT "id" FROM core."agent"
         WHERE "workspaceId" = $1
           AND ("responseFormat" IS NULL
             OR "responseFormat"->>'type' = 'text'
             OR "responseFormat"->>'type' IS NULL)`,
        [workspaceId],
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async migrateAgentsToJson(agentIds: string[]): Promise<void> {
    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      await queryRunner.query(
        `UPDATE core."agent"
         SET "responseFormat" = $1
         WHERE "id" = ANY($2)`,
        [JSON.stringify(TEXT_AGENT_DEFAULT_JSON_RESPONSE_FORMAT), agentIds],
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async updateWorkflowStepOutputSchemas(
    workspaceId: string,
    agentIds: string[],
  ): Promise<void> {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepository<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const allVersions = await workflowVersionRepository.find();

    let updatedVersionCount = 0;

    for (const version of allVersions) {
      if (!version.steps || !Array.isArray(version.steps)) {
        continue;
      }

      let versionModified = false;

      const updatedSteps = version.steps.map((step: WorkflowAction) => {
        if (step.type !== 'AI_AGENT') {
          return step;
        }

        const agentId = step.settings?.input?.agentId;

        if (!agentId || !agentIds.includes(agentId)) {
          return step;
        }

        const currentOutputSchema = step.settings?.outputSchema;

        if (
          currentOutputSchema &&
          Object.keys(currentOutputSchema).length > 0
        ) {
          return step;
        }

        versionModified = true;

        return {
          ...step,
          settings: {
            ...step.settings,
            outputSchema: TEXT_AGENT_DEFAULT_OUTPUT_SCHEMA,
          },
        };
      });

      if (versionModified) {
        await workflowVersionRepository.update(version.id, {
          steps: updatedSteps as WorkflowAction[],
        });
        updatedVersionCount++;
      }
    }

    if (updatedVersionCount > 0) {
      this.logger.log(
        `Updated output schemas in ${updatedVersionCount} workflow version(s) for workspace ${workspaceId}`,
      );
    }
  }

  private async invalidateCaches(workspaceId: string): Promise<void> {
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatAgentMaps',
    ]);

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );

    await this.workspaceCacheStorageService.flush(workspaceId);

    this.logger.log(
      `Cache invalidated and metadata version incremented for workspace ${workspaceId}`,
    );
  }
}
