import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { SearchService } from 'src/engine/metadata-modules/search/search.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import {
  NOTE_STANDARD_FIELD_IDS,
  TASK_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { SEARCH_FIELDS_FOR_NOTES } from 'src/modules/note/standard-objects/note.workspace-entity';
import { SEARCH_FIELDS_FOR_TASK } from 'src/modules/task/standard-objects/task.workspace-entity';

@Command({
  name: 'fix-0.33:update-rich-text-expression',
  description: 'Update rich text (note and task) search vector expressions',
})
export class UpdateRichTextSearchVectorCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly searchService: SearchService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    _options: ActiveWorkspacesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log('Running command to fix migration');

    for (const workspaceId of workspaceIds) {
      this.logger.log(`Running command for workspace ${workspaceId}`);

      try {
        const searchVectorFields = await this.fieldMetadataRepository.findBy({
          workspaceId: workspaceId,
          type: FieldMetadataType.TS_VECTOR,
        });

        for (const searchVectorField of searchVectorFields) {
          let fieldsUsedForSearch: FieldTypeAndNameMetadata[] = [];
          let objectNameForLog = '';

          switch (searchVectorField.standardId) {
            case NOTE_STANDARD_FIELD_IDS.searchVector: {
              fieldsUsedForSearch = SEARCH_FIELDS_FOR_NOTES;
              objectNameForLog = 'Note';
              break;
            }
            case TASK_STANDARD_FIELD_IDS.searchVector: {
              fieldsUsedForSearch = SEARCH_FIELDS_FOR_TASK;
              objectNameForLog = 'Task';
              break;
            }
          }

          if (fieldsUsedForSearch.length === 0) {
            continue;
          }

          this.logger.log(
            `Updating searchVector for ${searchVectorField.objectMetadataId} (${objectNameForLog})...`,
          );

          await this.searchService.updateSearchVector(
            searchVectorField.objectMetadataId,
            fieldsUsedForSearch,
            workspaceId,
          );

          await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
            workspaceId,
          );
        }
      } catch (error) {
        this.logger.log(
          chalk.red(
            `Running command on workspace ${workspaceId} failed with error: ${error}`,
          ),
        );
        continue;
      } finally {
        this.logger.log(
          chalk.green(`Finished running command for workspace ${workspaceId}.`),
        );
      }

      this.logger.log(chalk.green(`Command completed!`));
    }
  }
}
