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
import { FieldMetadataDefaultOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { tasksAssignedToMeView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-assigned-to-me';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { TASK_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';
import { ViewFilterWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter.workspace-entity';
import { ViewGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-group.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@Command({
  name: 'upgrade-0.43:add-tasks-assigned-to-me-view',
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
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
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
    this.logger.log('Running command to create many to one relations');

    if (isCommandLogger(this.logger)) {
      this.logger.setVerbose(options.verbose ?? false);
    }

    try {
      for (const [index, workspaceId] of workspaceIds.entries()) {
        await this.processWorkspace(workspaceId, index, workspaceIds.length);
      }

      this.logger.log(chalk.green('Command completed!'));
    } catch (error) {
      this.logger.log(chalk.red('Error in workspace'));
    }
  }

  private async processWorkspace(
    workspaceId: string,
    index: number,
    total: number,
  ): Promise<void> {
    try {
      this.logger.log(
        `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
      );

      const viewId = await this.createTasksAssignedToMeView(workspaceId);

      await this.createTasksAssignedToMeViewGroups(workspaceId, viewId);

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );

      this.logger.log(
        chalk.green(`Command completed for workspace ${workspaceId}.`),
      );
    } catch {
      this.logger.log(chalk.red(`Error in workspace ${workspaceId}.`));
    }
  }

  private async createTasksAssignedToMeView(
    workspaceId: string,
  ): Promise<string> {
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
      throw new Error(`Task object not found for workspace ${workspaceId}`);
    }

    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
        workspaceId,
        'view',
        false,
      );

    const existingView = await viewRepository.findOne({
      where: {
        name: 'Assigned to Me',
        objectMetadataId: taskObjectMetadata.id,
      },
    });

    if (existingView) {
      throw new Error(
        `"Assigned to Me" view already exists for workspace ${workspaceId}`,
      );
    }

    const viewDefinition = tasksAssignedToMeView(objectMetadataMap);
    const viewId = v4();

    const insertedView = await viewRepository.save({
      id: viewId,
      name: viewDefinition.name,
      objectMetadataId: viewDefinition.objectMetadataId,
      type: viewDefinition.type,
      position: viewDefinition.position,
      icon: viewDefinition.icon,
      kanbanFieldMetadataId: viewDefinition.kanbanFieldMetadataId,
    });

    if (viewDefinition.fields && viewDefinition.fields.length > 0) {
      const viewFieldRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewFieldWorkspaceEntity>(
          workspaceId,
          'viewField',
          false,
        );

      const viewFields = viewDefinition.fields.map((field) => ({
        fieldMetadataId: field.fieldMetadataId,
        position: field.position,
        isVisible: field.isVisible,
        size: field.size,
        viewId: insertedView.id,
      }));

      await viewFieldRepository.save(viewFields);
    }

    if (viewDefinition.filters && viewDefinition.filters.length > 0) {
      const viewFilterRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewFilterWorkspaceEntity>(
          workspaceId,
          'viewFilter',
          false,
        );

      const viewFilters = viewDefinition.filters.map((filter) => ({
        fieldMetadataId: filter.fieldMetadataId,
        displayValue: filter.displayValue,
        operand: filter.operand,
        value: filter.value,
        viewId: insertedView.id,
      }));

      await viewFilterRepository.save(viewFilters);
    }

    return insertedView.id;
  }

  private async createTasksAssignedToMeViewGroups(
    workspaceId: string,
    viewId: string,
  ) {
    const taskStatusFieldMetadata = await this.fieldMetadataRepository.findOne({
      where: {
        workspaceId,
        standardId: TASK_STANDARD_FIELD_IDS.status,
      },
    });

    if (!taskStatusFieldMetadata) {
      throw new Error(
        `Task status field metadata not found for workspace ${workspaceId}`,
      );
    }

    const optionValueViewGroups = taskStatusFieldMetadata.options.map(
      (taskStatusOption: FieldMetadataDefaultOption, index) =>
        ({
          fieldMetadataId: taskStatusFieldMetadata.id,
          viewId,
          fieldValue: taskStatusOption.value,
          position: index,
        }) satisfies Partial<ViewGroupWorkspaceEntity>,
    );

    const noValueViewGroup: Partial<ViewGroupWorkspaceEntity> = {
      fieldMetadataId: taskStatusFieldMetadata.id,
      viewId,
      fieldValue: '',
      position: optionValueViewGroups.length,
    };

    const viewGroups = [...optionValueViewGroups, noValueViewGroup];

    const viewGroupRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewGroupWorkspaceEntity>(
        workspaceId,
        'viewGroup',
        false,
      );

    await viewGroupRepository.insert(viewGroups);
  }
}
