import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { isCommandLogger } from 'src/database/commands/logger';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { tasksAssignedToMeView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-assigned-to-me';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';
import { ViewFilterWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@Command({
  name: 'upgrade-0.41:add-tasks-assigned-to-me-view',
  description: 'Add tasks assigned to me view',
})
export class AddTasksAssignedToMeViewCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ViewWorkspaceEntity, 'metadata')
    private readonly viewRepository: Repository<ViewWorkspaceEntity>,
    @InjectRepository(ViewFieldWorkspaceEntity, 'metadata')
    private readonly viewFieldRepository: Repository<ViewFieldWorkspaceEntity>,
    @InjectRepository(ViewFilterWorkspaceEntity, 'metadata')
    private readonly viewFilterRepository: Repository<ViewFilterWorkspaceEntity>,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: ActiveWorkspacesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log('Running command to add tasks assigned to me view');

    if (isCommandLogger(this.logger)) {
      this.logger.setVerbose(options.verbose ?? false);
    }

    let workspaceIterator = 1;

    for (const workspaceId of workspaceIds) {
      this.logger.log(
        `Running command for workspace ${workspaceId} ${workspaceIterator}/${workspaceIds.length}`,
      );

      try {
        const objectMetadata = await this.objectMetadataRepository.find({
          where: { workspaceId },
          relations: ['fields'],
        });

        const objectMetadataMap = objectMetadata.reduce((acc, object) => {
          acc[object.standardId ?? ''] = {
            id: object.id,
            fields: object.fields.reduce((acc, field) => {
              acc[field.standardId ?? ''] = field.id;

              return acc;
            }, {}),
          };

          return acc;
        }, {});

        const taskObjectMetadata = objectMetadata.find(
          (object) => object.standardId === STANDARD_OBJECT_IDS.task,
        );

        if (!taskObjectMetadata) {
          this.logger.warn(
            `Task object not found for workspace ${workspaceId}`,
          );
          workspaceIterator++;
          continue;
        }

        const existingView = await this.viewRepository.findOne({
          where: {
            name: 'Assigned to Me',
            objectMetadataId: taskObjectMetadata.id,
          },
        });

        if (existingView) {
          this.logger.log(
            `Tasks assigned to me view already exists for workspace ${workspaceId}`,
          );
          workspaceIterator++;
          continue;
        }

        const viewDefinition = tasksAssignedToMeView(objectMetadataMap);
        const viewId = v4();

        const views = await this.viewRepository.insert(
          {
            name: viewDefinition.name,
            objectMetadataId: viewDefinition.objectMetadataId,
            type: viewDefinition.type,
            position: viewDefinition.position,
            icon: viewDefinition.icon,
            kanbanFieldMetadataId: viewDefinition.kanbanFieldMetadataId,
          },
        );

        const view = views[0];

        if (viewDefinition.fields && viewDefinition.fields.length > 0) {
          const viewFields = viewDefinition.fields.map((field) => ({
            fieldMetadataId: field.fieldMetadataId,
            position: field.position,
            isVisible: field.isVisible,
            size: field.size,
            viewId: view.id,
          }));

          await this.viewFieldRepository.save(viewFields);
        }

        if (viewDefinition.filters && viewDefinition.filters.length > 0) {
          const viewFilters = viewDefinition.filters.map((filter) => ({
            fieldMetadataId: filter.fieldMetadataId,
            displayValue: filter.displayValue,
            operand: filter.operand,
            value: filter.value,
            viewId: view.id,
          }));

          await this.viewFilterRepository.save(viewFilters);
        }

        await this.workspaceMetadataVersionService.incrementMetadataVersion(
          workspaceId,
        );

        workspaceIterator++;
        this.logger.log(
          chalk.green(`Command completed for workspace ${workspaceId}.`),
        );
      } catch (error) {
        this.logger.error(
          chalk.red(`Error in workspace ${workspaceId}: ${error.message}`),
        );
        workspaceIterator++;
      }
    }
    this.logger.log(chalk.green(`Command completed!`));
  }
}
