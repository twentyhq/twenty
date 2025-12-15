import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { type Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { isDefined } from 'twenty-shared/utils';

// Standard IDs of agents that were removed from the codebase
const REMOVED_AGENT_STANDARD_IDS = [
  '20202020-0002-0001-0001-000000000006', // dashboard-builder
  '20202020-0002-0001-0001-000000000003', // data-manipulator
  '20202020-0002-0001-0001-000000000007', // metadata-builder
  '20202020-0002-0001-0001-000000000005', // researcher
  '20202020-0002-0001-0001-000000000001', // workflow-builder
];

// Helper agent standard ID
const HELPER_AGENT_STANDARD_ID = '20202020-0002-0001-0001-000000000004';

// Data manipulator role standard ID
const DATA_MANIPULATOR_ROLE_STANDARD_ID =
  '20202020-0001-0001-0001-000000000004';

@Command({
  name: 'upgrade:1-14:delete-removed-agents',
  description:
    'Delete agents that were removed from the codebase and update helper agent role',
})
export class DeleteRemovedAgentsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly agentService: AgentService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    options,
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun || false;

    const { flatAgentMaps, flatRoleTargetByAgentIdMaps, flatRoleMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatAgentMaps',
        'flatRoleTargetByAgentIdMaps',
        'flatRoleMaps',
      ]);

    const allAgents = Object.values(flatAgentMaps.byId).filter(isDefined);

    const agentsToDelete = allAgents.filter((agent) =>
      REMOVED_AGENT_STANDARD_IDS.includes(agent.standardId ?? ''),
    );

    const helperAgent = allAgents.find(
      (agent) => agent.standardId === HELPER_AGENT_STANDARD_ID,
    );

    const dataManipulatorRole = Object.values(flatRoleMaps.byId)
      .filter(isDefined)
      .find((role) => role.standardId === DATA_MANIPULATOR_ROLE_STANDARD_ID);

    const existingHelperRoleTarget = isDefined(helperAgent)
      ? flatRoleTargetByAgentIdMaps[helperAgent.id]
      : undefined;

    const shouldUpdateHelperRole =
      isDefined(helperAgent) &&
      isDefined(dataManipulatorRole) &&
      existingHelperRoleTarget?.roleId !== dataManipulatorRole.id;

    const hasAgentsToDelete = agentsToDelete.length > 0;

    if (!hasAgentsToDelete && !shouldUpdateHelperRole) {
      return;
    }

    const agentNames = agentsToDelete.map((agent) => agent.name).join(', ');

    if (isDryRun) {
      if (hasAgentsToDelete) {
        this.logger.log(
          `DRY RUN: Would delete ${agentsToDelete.length} removed agent(s): ${agentNames}`,
        );
      }
      if (shouldUpdateHelperRole) {
        this.logger.log(
          `DRY RUN: Would update helper agent role to data manipulator role`,
        );
      }

      return;
    }

    if (hasAgentsToDelete) {
      const agentIds = agentsToDelete.map((agent) => agent.id);

      await this.agentService.deleteManyAgents({
        ids: agentIds,
        workspaceId,
        isSystemBuild: true,
      });

      this.logger.log(
        `Deleted ${agentsToDelete.length} removed agent(s): ${agentNames}`,
      );
    }

    if (shouldUpdateHelperRole && isDefined(helperAgent)) {
      await this.agentService.updateOneAgent({
        input: {
          id: helperAgent.id,
          roleId: dataManipulatorRole.id,
        },
        workspaceId,
      });

      this.logger.log(`Updated helper agent role to data manipulator role`);
    }
  }
}
