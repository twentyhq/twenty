import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:1-6:fix-label-identifier-position-and-visibility',
  description:
    'Fix label identifier position to ensure it has the minimal position in each view',
})
export class FixLabelIdentifierPositionAndVisibilityCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Checking label identifiers position and visibility for workspace ${workspaceId}`,
    );

    const views = await this.viewRepository.find({
      where: { workspaceId },
      relations: {
        objectMetadata: true,
        viewFields: true,
      },
    });

    for (const view of views) {
      const { objectMetadata, viewFields } = view;

      if (!objectMetadata.labelIdentifierFieldMetadataId) {
        continue;
      }

      const labelIdentifierViewField = viewFields.find(
        (viewField: ViewFieldEntity) =>
          viewField.fieldMetadataId ===
          objectMetadata.labelIdentifierFieldMetadataId,
      );

      if (!labelIdentifierViewField) {
        continue;
      }

      // Find minimum position and count fields at that position in single pass
      const minPositionData = viewFields.reduce(
        (acc, viewField: ViewFieldEntity) => {
          if (viewField.position < acc.minPosition) {
            return { minPosition: viewField.position, count: 1 };
          }
          if (viewField.position === acc.minPosition) {
            return { ...acc, count: acc.count + 1 };
          }

          return acc;
        },
        { minPosition: Number.MAX_SAFE_INTEGER, count: 0 },
      );

      const minPosition = minPositionData.minPosition;
      const numberOfViewFieldsAtTheMinimalPosition = minPositionData.count;

      const labelIdentifierPositionIsAlreadyTheMinimalPosition =
        labelIdentifierViewField.position === minPosition &&
        numberOfViewFieldsAtTheMinimalPosition === 1;

      const labelIdentifierIsAlreadyVisible =
        labelIdentifierViewField.isVisible;

      if (
        labelIdentifierPositionIsAlreadyTheMinimalPosition &&
        labelIdentifierIsAlreadyVisible
      ) {
        continue;
      }

      if (!labelIdentifierPositionIsAlreadyTheMinimalPosition) {
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

      if (!labelIdentifierIsAlreadyVisible) {
        if (!options.dryRun) {
          await this.viewFieldRepository.update(
            { id: labelIdentifierViewField.id },
            { isVisible: true },
          );
        }

        this.logger.log(
          `Fixed label identifier visibility for view ${view.id} in workspace ${workspaceId}: ${labelIdentifierViewField.isVisible} -> true`,
        );
      }
    }
  }
}
