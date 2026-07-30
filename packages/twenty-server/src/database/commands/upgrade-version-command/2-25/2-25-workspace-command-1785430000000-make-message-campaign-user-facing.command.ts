import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// isSystem is not diffable by the workspace migration engine (toCompare:
// false), so this backfill updates the metadata row directly and invalidates
// the workspace cache.
@RegisteredWorkspaceCommand('2.25.0', 1785430000000)
@Command({
  name: 'upgrade:2-25:make-message-campaign-user-facing',
  description:
    'Mark messageCampaign as a non-system object so its standard fields (like the campaign name) are editable in the UI, aligning it with dashboards and workflows',
})
export class MakeMessageCampaignUserFacingCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const campaignObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.messageCampaign.universalIdentifier,
      });

    if (!isDefined(campaignObjectMetadata)) {
      this.logger.log(
        `messageCampaign object does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (campaignObjectMetadata.isSystem === false) {
      this.logger.log(
        `messageCampaign is already user-facing for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would mark messageCampaign as non-system`,
      );

      return;
    }

    await this.objectMetadataRepository.update(
      { id: campaignObjectMetadata.id, workspaceId },
      { isSystem: false },
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatObjectMetadataMaps',
    ]);

    this.logger.log(
      `Marked messageCampaign as user-facing for workspace ${workspaceId}`,
    );
  }
}
