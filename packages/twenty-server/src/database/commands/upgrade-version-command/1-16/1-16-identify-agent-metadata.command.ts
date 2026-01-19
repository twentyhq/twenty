import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_AGENT } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-agent.constant';

@Command({
  name: 'upgrade:1-16:identify-agent-metadata',
  description: 'Identify standard agent metadata',
})
export class IdentifyAgentMetadataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    protected readonly applicationService: ApplicationService,
    protected readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running identify standard agent metadata for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await this.identifyStandardAgent({
      workspaceId,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
      dryRun: options.dryRun ?? false,
    });

    await this.identifyCustomAgents({
      workspaceId,
      workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      dryRun: options.dryRun ?? false,
    });

    const relatedMetadataNames = getMetadataRelatedMetadataNames('agent');
    const relatedCacheKeysToInvalidate = relatedMetadataNames.map(
      getMetadataFlatEntityMapsKey,
    );

    this.logger.log(
      `Invalidating caches: flatAgentMaps ${relatedCacheKeysToInvalidate.join(' ')}`,
    );
    if (!options.dryRun) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatAgentMaps',
        ...relatedCacheKeysToInvalidate,
      ]);
    }
  }

  private async identifyStandardAgent({
    workspaceId,
    twentyStandardApplicationId,
    dryRun,
  }: {
    workspaceId: string;
    twentyStandardApplicationId: string;
    dryRun: boolean;
  }): Promise<void> {
    const helperAgent = await this.agentRepository.findOne({
      select: {
        id: true,
        name: true,
        universalIdentifier: true,
        applicationId: true,
      },
      where: {
        workspaceId,
        name: 'helper',
        isCustom: false,
      },
      withDeleted: true,
    });

    if (!isDefined(helperAgent)) {
      this.logger.warn(
        `Standard agent "helper" not found for workspace ${workspaceId}, skipping standard agent identification`,
      );

      return;
    }

    if (isDefined(helperAgent.applicationId)) {
      this.logger.warn(
        `Standard agent "helper" already has applicationId set, skipping`,
      );

      return;
    }

    this.logger.log(
      `  - Standard agent "helper" (id=${helperAgent.id}) -> universalIdentifier=${STANDARD_AGENT.helper.universalIdentifier}`,
    );

    if (!dryRun) {
      await this.agentRepository.save({
        id: helperAgent.id,
        universalIdentifier: STANDARD_AGENT.helper.universalIdentifier,
        applicationId: twentyStandardApplicationId,
      });
    }
  }

  private async identifyCustomAgents({
    workspaceId,
    workspaceCustomApplicationId,
    dryRun,
  }: {
    workspaceId: string;
    workspaceCustomApplicationId: string;
    dryRun: boolean;
  }): Promise<void> {
    const remainingCustomAgents = await this.agentRepository.find({
      select: {
        id: true,
        universalIdentifier: true,
        applicationId: true,
      },
      where: {
        workspaceId,
        applicationId: IsNull(),
      },
      withDeleted: true,
    });

    const customUpdates = remainingCustomAgents.map((agentEntity) => ({
      id: agentEntity.id,
      universalIdentifier: agentEntity.universalIdentifier ?? v4(),
      applicationId: workspaceCustomApplicationId,
    }));

    this.logger.log(
      `Found ${customUpdates.length} custom agent(s) to update for workspace ${workspaceId}`,
    );

    if (!dryRun) {
      await this.agentRepository.save(customUpdates);
    }
  }
}
