import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:1-6:fix-label-identifier-position',
  description:
    'Fix label identifier position to ensure it has the minimal position in each view',
})
export class FixLabelIdentifierPositionCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Checking label identifiers position for workspace ${workspaceId}`,
    );

    // Get all views with their related object metadata and view fields
    const views = await this.viewRepository.find({
      where: { workspaceId },
      relations: {
        objectMetadata: true,
        viewFields: true,
      },
    });

    for (const view of views) {
      const { objectMetadata, viewFields } = view;

      // Skip if no label identifier field metadata ID
      if (!objectMetadata.labelIdentifierFieldMetadataId) {
        continue;
      }

      // Find the label identifier view field
      const labelIdentifierViewField = viewFields.find(
        (viewField: ViewFieldEntity) =>
          viewField.fieldMetadataId ===
          objectMetadata.labelIdentifierFieldMetadataId,
      );

      // Skip if label identifier view field not found
      if (!labelIdentifierViewField) {
        continue;
      }

      // Find the minimum position among all view fields
      const minPosition = Math.min(
        ...viewFields.map((viewField: ViewFieldEntity) => viewField.position),
      );

      // Check if label identifier already has the minimal position
      if (labelIdentifierViewField.position === minPosition) {
        this.logger.log(
          `Label identifier position is already the minimal position for view ${view.id} in workspace ${workspaceId}`,
        );
        continue;
      }

      // Update the label identifier position to be the minimal one
      const newPosition = minPosition - 1;

      if (!options.dryRun) {
        await this.viewFieldRepository.update(
          { id: labelIdentifierViewField.id },
          { position: newPosition },
        );

        this.logger.log(
          `Fixed label identifier position for view ${view.id} in workspace ${workspaceId}: ${labelIdentifierViewField.position} -> ${newPosition}`,
        );
      } else {
        this.logger.log(
          `Would fix label identifier position for view ${view.id} in workspace ${workspaceId}: ${labelIdentifierViewField.position} -> ${newPosition}`,
        );
      }
    }
  }
}
