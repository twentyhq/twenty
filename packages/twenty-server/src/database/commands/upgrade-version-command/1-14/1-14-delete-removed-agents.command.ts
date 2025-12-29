import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FlatAgentMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-agent-maps.type';
import { MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const REMOVED_AGENT_STANDARD_IDS = [
  '20202020-0002-0001-0001-000000000006', // dashboard-builder
  '20202020-0002-0001-0001-000000000003', // data-manipulator
  '20202020-0002-0001-0001-000000000007', // metadata-builder
  '20202020-0002-0001-0001-000000000005', // researcher
  '20202020-0002-0001-0001-000000000001', // workflow-builder
];

const REMOVED_ROLE_STANDARD_IDS = [
  '20202020-0001-0001-0001-000000000002', // workflow-manager
  '20202020-0001-0001-0001-000000000004', // data-manipulator
  '20202020-0001-0001-0001-000000000005', // dashboard-manager
  '20202020-0001-0001-0001-000000000006', // data-model-manager
];

@Command({
  name: 'upgrade:1-14:delete-removed-agents',
  description: 'Delete agents and roles that were removed from the codebase',
})
export class DeleteRemovedAgentsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly agentService: AgentService,
    private readonly roleService: RoleService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    options,
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun || false;

    const { flatAgentMaps, flatRoleMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatAgentMaps',
        'flatRoleMaps',
      ]);

    await this.deleteRemovedAgents({ flatAgentMaps, workspaceId, isDryRun });
    await this.deleteRemovedRoles({ flatRoleMaps, workspaceId, isDryRun });
  }

  private async deleteRemovedAgents({
    flatAgentMaps,
    workspaceId,
    isDryRun,
  }: {
    flatAgentMaps: FlatAgentMaps;
    workspaceId: string;
    isDryRun: boolean;
  }): Promise<void> {
    const allAgents = Object.values(flatAgentMaps.byId).filter(isDefined);

    const agentsToDelete = allAgents.filter((agent) =>
      REMOVED_AGENT_STANDARD_IDS.includes(agent.standardId ?? ''),
    );

    const agentNames = agentsToDelete.map((agent) => agent.name).join(', ');

    this.logger.log(
      `DRY RUN: Would delete ${agentsToDelete.length} removed agent(s): ${agentNames}`,
    );

    if (agentsToDelete.length === 0 || isDryRun) {
      return;
    }

    const agentIds = agentsToDelete.map((agent) => agent.id);

    try {
      await this.agentService.deleteManyAgents({
        ids: agentIds,
        workspaceId,
        isSystemBuild: true,
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete workspace agents \n ${JSON.stringify(error, null, 2)}`,
      );

      throw error;
    }

    this.logger.log(
      `Deleted ${agentsToDelete.length} removed agent(s): ${agentNames}`,
    );
  }

  private async deleteRemovedRoles({
    flatRoleMaps,
    workspaceId,
    isDryRun,
  }: {
    flatRoleMaps: MetadataFlatEntityMaps<'role'>;
    workspaceId: string;
    isDryRun: boolean;
  }): Promise<void> {
    const allRoles = Object.values(flatRoleMaps.byId).filter(isDefined);

    const rolesToDelete = allRoles.filter((role) =>
      REMOVED_ROLE_STANDARD_IDS.includes(role.standardId ?? ''),
    );

    const roleLabels = rolesToDelete.map((role) => role.label).join(', ');

    this.logger.log(
      `DRY RUN: Would delete ${rolesToDelete.length} removed role(s): ${roleLabels}`,
    );

    if (rolesToDelete.length === 0 || isDryRun) {
      return;
    }

    const roleIds = rolesToDelete.map((role) => role.id);

    try {
      await this.roleService.deleteManyRoles({
        ids: roleIds,
        workspaceId,
        isSystemBuild: true,
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete workspace roles \n ${JSON.stringify(error, null, 2)}`,
      );

      throw error;
    }

    this.logger.log(
      `Deleted ${rolesToDelete.length} removed role(s): ${roleLabels}`,
    );
  }
}
