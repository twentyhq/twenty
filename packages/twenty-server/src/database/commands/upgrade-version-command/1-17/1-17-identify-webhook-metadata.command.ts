import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, IsNull, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Command({
  name: 'upgrade:1-17:identify-webhook-metadata',
  description:
    'Identify webhook metadata (backfill universalIdentifier and applicationId)',
})
export class IdentifyWebhookMetadataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    protected readonly applicationService: ApplicationService,
    protected readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running identify webhook metadata for workspace ${workspaceId}`,
    );

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await this.identifyWebhookEntities({
      workspaceId,
      workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      dryRun: options.dryRun ?? false,
    });
  }

  private async identifyWebhookEntities({
    workspaceId,
    workspaceCustomApplicationId,
    dryRun,
  }: {
    workspaceId: string;
    workspaceCustomApplicationId: string;
    dryRun: boolean;
  }): Promise<void> {
    const webhookRepository = this.coreDataSource.getRepository(WebhookEntity);

    const webhooksWithoutApplicationId = await webhookRepository.find({
      select: ['id', 'universalIdentifier', 'applicationId'],
      where: {
        workspaceId,
        applicationId: IsNull(),
      },
      withDeleted: true,
    });

    if (webhooksWithoutApplicationId.length === 0) {
      this.logger.log(
        `No webhook entities found without applicationId for workspace ${workspaceId}`,
      );

      return;
    }

    const updates = webhooksWithoutApplicationId.map((webhook) => ({
      id: webhook.id,
      universalIdentifier: webhook.universalIdentifier ?? v4(),
      applicationId: workspaceCustomApplicationId,
    }));

    this.logger.log(
      `Found ${updates.length} webhook entities to update for workspace ${workspaceId}`,
    );

    if (!dryRun) {
      await webhookRepository.save(updates);
    }

    const relatedMetadataNames = getMetadataRelatedMetadataNames('webhook');
    const relatedCacheKeysToInvalidate = relatedMetadataNames.map(
      getMetadataFlatEntityMapsKey,
    );

    const flatEntityMapsKey = getMetadataFlatEntityMapsKey('webhook');

    this.logger.log(
      `Invalidating caches: ${flatEntityMapsKey} ${relatedCacheKeysToInvalidate.join(' ')}`,
    );

    if (!dryRun) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        flatEntityMapsKey,
        ...relatedCacheKeysToInvalidate,
      ]);
    }
  }
}
