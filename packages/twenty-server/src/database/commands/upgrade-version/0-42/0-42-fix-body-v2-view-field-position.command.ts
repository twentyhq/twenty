import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { In, Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { isCommandLogger } from 'src/database/commands/logger';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@Command({
  name: 'upgrade-0.42:fix-body-v2-view-field-position',
  description: 'Make bodyV2 field position to match body field position',
})
export class FixBodyV2ViewFieldPositionCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: ActiveWorkspacesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log('Running command to fix bodyV2 field position');

    if (isCommandLogger(this.logger)) {
      this.logger.setVerbose(options.verbose ?? false);
    }

    try {
      for (const [index, workspaceId] of workspaceIds.entries()) {
        await this.processWorkspace(workspaceId, index, workspaceIds.length);
      }

      this.logger.log(chalk.green('Command completed!'));
    } catch (error) {
      this.logger.log(chalk.red('Error executing command'));
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

      const viewRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
          workspaceId,
          'view',
        );

      const viewFieldRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewFieldWorkspaceEntity>(
          workspaceId,
          'viewField',
          false,
        );

      const taskAndNoteObjectMetadatas =
        await this.objectMetadataRepository.find({
          where: {
            workspaceId,
            nameSingular: In(['note', 'task']),
          },
          relations: ['fields'],
        });

      const taskAndNoteViews = await viewRepository.find({
        where: {
          objectMetadataId: In(
            taskAndNoteObjectMetadatas.map((object) => object.id),
          ),
        },
      });

      const fieldMetadatas = taskAndNoteObjectMetadatas.flatMap(
        (objectMetadata) => objectMetadata.fields,
      );

      const fieldNameByMetadataId: Record<string, string> =
        fieldMetadatas.reduce(
          (fieldNameByMetadataId, fieldMetadata) => ({
            ...fieldNameByMetadataId,
            [fieldMetadata.id]: fieldMetadata.name,
          }),
          {},
        );

      for (const view of taskAndNoteViews) {
        this.logger.log(
          `Updating bodyV2 field position for view ${view.id} - ${view.name}`,
        );
        const viewFields = await viewFieldRepository.find({
          where: {
            viewId: view.id,
          },
        });

        const bodyViewField = viewFields.find(
          (viewField) =>
            fieldNameByMetadataId[viewField.fieldMetadataId] === 'body',
        );
        const bodyV2ViewField = viewFields.find(
          (viewField) =>
            fieldNameByMetadataId[viewField.fieldMetadataId] === 'bodyV2',
        );

        if (bodyViewField && bodyV2ViewField) {
          this.logger.log(
            `Setting body field position to ${bodyV2ViewField?.position} and bodyV2 field position to ${bodyViewField?.position}`,
          );

          await viewFieldRepository.update(
            { id: bodyViewField.id },
            {
              position: bodyV2ViewField.position,
              isVisible: false,
            },
          );
          await viewFieldRepository.update(
            { id: bodyV2ViewField.id },
            {
              position: bodyViewField.position,
              isVisible: bodyViewField.isVisible,
            },
          );
        } else if (bodyViewField && !bodyV2ViewField) {
          this.logger.log(
            `Creating bodyV2 view field for view ${view.id} with position ${viewFields.length}`,
          );

          const bodyV2FieldMetadataId = fieldMetadatas.find(
            (field) => field.name === 'bodyV2',
          )?.id;

          const viewFieldToCreate = viewFieldRepository.create({
            fieldMetadataId: bodyV2FieldMetadataId,
            viewId: view.id,
            position: bodyViewField.position,
            isVisible: bodyViewField.isVisible,
            size: bodyViewField.size,
            aggregateOperation: bodyViewField.aggregateOperation,
          });

          await viewFieldRepository.save(viewFieldToCreate);

          await viewFieldRepository.update(
            { id: bodyViewField.id },
            {
              position: viewFields.length,
              isVisible: false,
            },
          );
        }
      }

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );

      this.logger.log(
        chalk.green(`Command completed for workspace ${workspaceId}`),
      );
    } catch (error) {
      this.logger.log(chalk.red(`Error in workspace ${workspaceId}`));
    }

    await this.twentyORMGlobalManager.destroyDataSourceForWorkspace(
      workspaceId,
    );
  }
}
