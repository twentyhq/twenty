import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SearchService } from 'src/engine/metadata-modules/search/search.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { SEARCH_FIELDS_FOR_NOTES } from 'src/modules/note/standard-objects/note.workspace-entity';
import { SEARCH_FIELDS_FOR_TASKS } from 'src/modules/task/standard-objects/task.workspace-entity';

@Command({
  name: 'upgrade:0-43:migrate-search-vector-on-note-and-task-entities',
  description: 'Migrate search vector on note and task entities',
})
export class MigrateSearchVectorOnNoteAndTaskEntitiesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(FeatureFlag, 'core')
    protected readonly featureFlagRepository: Repository<FeatureFlag>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    protected readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly searchService: SearchService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    const noteObjectMetadata =
      await this.objectMetadataRepository.findOneOrFail({
        select: ['id'],
        where: {
          workspaceId,
          nameSingular: 'note',
        },
      });

    if (!options.dryRun) {
      await this.searchService.updateSearchVector(
        noteObjectMetadata.id,
        SEARCH_FIELDS_FOR_NOTES,
        workspaceId,
      );
    }

    const taskObjectMetadata =
      await this.objectMetadataRepository.findOneOrFail({
        select: ['id'],
        where: {
          workspaceId,
          nameSingular: 'task',
        },
      });

    if (!options.dryRun) {
      await this.searchService.updateSearchVector(
        taskObjectMetadata.id,
        SEARCH_FIELDS_FOR_TASKS,
        workspaceId,
      );
    }

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      workspaceId,
    );

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );

    this.logger.log(
      `Migrated search vector on note and task entities for workspace ${workspaceId}`,
    );
  }
}
