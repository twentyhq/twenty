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
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@Command({
  name: 'upgrade-0.41:fix-body-v2-view-field-position',
  description: 'Make bodyV2 field position to match body field position',
})
export class FixBodyV2ViewFieldPositionCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
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

    let workspaceIterator = 1;

    for (const workspaceId of workspaceIds) {
      this.logger.log(
        `Running command for workspace ${workspaceId} ${workspaceIterator}/${workspaceIds.length}`,
      );

      try {
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

        const taskAndNoteObjectMetadata =
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
              taskAndNoteObjectMetadata.map((object) => object.id),
            ),
          },
        });

        for (const view of taskAndNoteViews) {
          const viewFields = await viewFieldRepository.find({
            where: {
              viewId: view.id,
            },
          });

          const fields = taskAndNoteObjectMetadata.flatMap(
            (objectMetadata) => objectMetadata.fields,
          );

          const fieldNameByMetadataId: Record<string, string> = fields.reduce(
            (fieldNameByMetadataId, fieldMetadata) => ({
              ...fieldNameByMetadataId,
              [fieldMetadata.id]: fieldMetadata.name,
            }),
            {},
          );

          const bodyField = viewFields.find(
            (field) => fieldNameByMetadataId[field.fieldMetadataId] === 'body',
          );
          const bodyV2Field = viewFields.find(
            (field) =>
              fieldNameByMetadataId[field.fieldMetadataId] === 'bodyV2',
          );

          if (bodyField && bodyV2Field) {
            await viewFieldRepository.update(
              { id: bodyV2Field.id },
              { position: bodyField.position, isVisible: bodyField.isVisible },
            );
            chalk.green(
              `Updated bodyV2 field position for view ${view.id} to ${bodyField.position}`,
            );
          } else {
            chalk.red(`No body or bodyV2 field found for view ${view.id}`);
          }

          await this.workspaceMetadataVersionService.incrementMetadataVersion(
            workspaceId,
          );

          workspaceIterator++;
          this.logger.log(
            chalk.green(`Command completed for workspace ${workspaceId}`),
          );
        }
      } catch {
        this.logger.log(chalk.red(`Error in workspace ${workspaceId}`));
        workspaceIterator++;
      }
    }

    this.logger.log(chalk.green('Command completed!'));
  }
}
