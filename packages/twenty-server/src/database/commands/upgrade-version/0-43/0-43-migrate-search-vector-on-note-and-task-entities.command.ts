import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SearchService } from 'src/engine/metadata-modules/search/search.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { SEARCH_FIELDS_FOR_NOTES } from 'src/modules/note/standard-objects/note.workspace-entity';
import { SEARCH_FIELDS_FOR_TASKS } from 'src/modules/task/standard-objects/task.workspace-entity';

@Command({
  name: 'upgrade-0.43:migrate-search-vector-on-note-and-task-entities',
  description: 'Migrate search vector on note and task entities',
})
export class MigrateSearchVectorOnNoteAndTaskEntitiesCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FeatureFlag, 'core')
    protected readonly featureFlagRepository: Repository<FeatureFlag>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    protected readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly searchService: SearchService,
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
    this.logger.log(
      'Running command to migrate search vector on note and task entities',
    );

    for (const [index, workspaceId] of workspaceIds.entries()) {
      await this.processWorkspace(workspaceId, index, workspaceIds.length);
    }

    this.logger.log(chalk.green('Command completed!'));
  }

  async processWorkspace(
    workspaceId: string,
    index: number,
    total: number,
  ): Promise<void> {
    try {
      this.logger.log(
        `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
      );

      await this.featureFlagRepository.findOneOrFail({
        where: {
          workspaceId,
          key: FeatureFlagKey.IsRichTextV2Enabled,
          value: true,
        },
      });

      const noteObjectMetadata =
        await this.objectMetadataRepository.findOneOrFail({
          select: ['id'],
          where: {
            workspaceId,
            nameSingular: 'note',
          },
        });

      await this.searchService.updateSearchVector(
        noteObjectMetadata.id,
        SEARCH_FIELDS_FOR_NOTES,
        workspaceId,
      );

      const taskObjectMetadata =
        await this.objectMetadataRepository.findOneOrFail({
          select: ['id'],
          where: {
            workspaceId,
            nameSingular: 'task',
          },
        });

      await this.searchService.updateSearchVector(
        taskObjectMetadata.id,
        SEARCH_FIELDS_FOR_TASKS,
        workspaceId,
      );

      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
        workspaceId,
      );

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );
    } catch (error) {
      this.logger.log(
        chalk.red(`Error in workspace ${workspaceId} - ${error.message}`),
      );
    }
  }
}
