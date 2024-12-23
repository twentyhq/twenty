import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { BaseCommandOptions } from 'src/database/commands/base.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataRelatedRecordsService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-related-records.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ViewGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-group.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@Command({
  name: 'migrate-0.35:backfill-view-group-no-value',
  description: 'Backfill view group no value',
})
export class ViewGroupNoValueBackfillCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly fieldMetadataRelatedRecordsService: FieldMetadataRelatedRecordsService,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    _options: BaseCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    for (const workspaceId of workspaceIds) {
      try {
        const viewRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
            workspaceId,
            'view',
          );

        const viewGroupRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewGroupWorkspaceEntity>(
            workspaceId,
            'viewGroup',
          );

        const views = await viewRepository.find({
          relations: ['viewGroups'],
        });

        for (const view of views) {
          if (view.viewGroups.length === 0) {
            continue;
          }

          // We're assuming for now that all viewGroups belonging to the same view have the same fieldMetadataId
          const viewGroup = view.viewGroups?.[0];
          const fieldMetadataId = viewGroup?.fieldMetadataId;

          if (!fieldMetadataId || !viewGroup) {
            continue;
          }

          const fieldMetadata = await this.fieldMetadataRepository.findOne({
            where: { id: viewGroup.fieldMetadataId },
          });

          if (!fieldMetadata) {
            continue;
          }

          await this.fieldMetadataRelatedRecordsService.syncNoValueViewGroup(
            fieldMetadata,
            view,
            viewGroupRepository,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error backfilling view group no value for workspace ${workspaceId}: ${error}`,
        );
      }
    }
  }
}
