import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
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
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const textAgents = await this.findTextFormatCustomAgents(workspaceId);

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

    await this.migrateAgentsToJson(workspaceId, textAgents);

    const textAgentIds = textAgents.map((agent) => agent.id);

    await this.updateWorkflowStepOutputSchemas(workspaceId, textAgentIds);

    this.logger.log(
      `Successfully migrated ${textAgents.length} agent(s) to JSON response format for workspace ${workspaceId}`,
    );
  }

  private async findTextFormatCustomAgents(
    workspaceId: string,
  ): Promise<FlatAgent[]> {
    const { flatAgentMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatAgentMaps'],
    );

    return Object.values(flatAgentMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((flatAgent) => this.isTextFormatCustomAgent(flatAgent));
  }

  private isTextFormatCustomAgent(flatAgent: FlatAgent): boolean {
    if (!flatAgent.isCustom) {
      return false;
    }

    const responseFormat = flatAgent.responseFormat as
      | {
          type?: string;
        }
      | null
      | undefined;

    return !isDefined(responseFormat?.type) || responseFormat.type === 'text';
  }

  private async migrateAgentsToJson(
    workspaceId: string,
    textAgents: FlatAgent[],
  ): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            agent: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: textAgents.map((textAgent) => ({
                ...textAgent,
                responseFormat: TEXT_AGENT_DEFAULT_JSON_RESPONSE_FORMAT,
              })),
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to migrate agents to JSON response format:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );
      throw new Error(
        `Failed to migrate text-format agents for workspace ${workspaceId}`,
      );
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
}
