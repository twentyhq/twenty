import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ADD_MISSING_SYSTEM_FIELDS_TO_STANDARD_OBJECTS_1771420702241 } from 'src/database/commands/upgrade-version-command/workspace-migrations/1771420702241-add-missing-system-fields-to-standard-objects';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration.type';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const { applicationUniversalIdentifier, actions: allActions } =
  ADD_MISSING_SYSTEM_FIELDS_TO_STANDARD_OBJECTS_1771420702241;

// Sentinel identifiers extracted from the const tuple where TypeScript
// knows every element is a create action with flatEntity.
const FIRST_NON_TS_VECTOR_UNIVERSAL_IDENTIFIER =
  allActions[0].flatEntity.universalIdentifier;

const FIRST_TS_VECTOR_UNIVERSAL_IDENTIFIER =
  allActions[1].flatEntity.universalIdentifier;

const NON_TS_VECTOR_MIGRATION: WorkspaceMigration = {
  applicationUniversalIdentifier,
  actions: allActions.filter(
    (action) => action.flatEntity.type !== FieldMetadataType.TS_VECTOR,
  ),
};

const TS_VECTOR_MIGRATION: WorkspaceMigration = {
  applicationUniversalIdentifier,
  actions: allActions.filter(
    (action) => action.flatEntity.type === FieldMetadataType.TS_VECTOR,
  ),
};

@Command({
  name: 'upgrade:1-19:add-missing-system-fields-to-standard-objects',
  description:
    'Add missing system fields (position, searchVector, createdBy, updatedBy) to standard objects',
})
export class AddMissingSystemFieldsToStandardObjectsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  private async hasFieldBeenCreated(
    workspaceId: string,
    universalIdentifier: string,
  ): Promise<boolean> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    return isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
    );
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options?.dryRun ?? false;

    this.logger.log(
      `${dryRun ? '[DRY RUN] ' : ''}Adding missing system fields to standard objects in workspace ${workspaceId}`,
    );

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would add ${NON_TS_VECTOR_MIGRATION.actions.length} non-tsVector fields and ${TS_VECTOR_MIGRATION.actions.length} tsVector fields to standard objects in workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    const nonTsVectorAlreadyRan = await this.hasFieldBeenCreated(
      workspaceId,
      FIRST_NON_TS_VECTOR_UNIVERSAL_IDENTIFIER,
    );

    if (!nonTsVectorAlreadyRan) {
      this.logger.log(
        `Adding ${NON_TS_VECTOR_MIGRATION.actions.length} non-tsVector fields (position, createdBy, updatedBy) in workspace ${workspaceId}`,
      );

      await this.workspaceMigrationRunnerService.run({
        workspaceId,
        workspaceMigration: NON_TS_VECTOR_MIGRATION,
      });
    } else {
      this.logger.log(
        `Non-tsVector fields already exist in workspace ${workspaceId}, skipping.`,
      );
    }

    const tsVectorAlreadyRan = await this.hasFieldBeenCreated(
      workspaceId,
      FIRST_TS_VECTOR_UNIVERSAL_IDENTIFIER,
    );

    if (!tsVectorAlreadyRan) {
      this.logger.log(
        `Adding ${TS_VECTOR_MIGRATION.actions.length} tsVector fields in workspace ${workspaceId} (this may take a while on large tables)`,
      );

      await this.workspaceMigrationRunnerService.run({
        workspaceId,
        workspaceMigration: TS_VECTOR_MIGRATION,
      });
    } else {
      this.logger.log(
        `TsVector fields already exist in workspace ${workspaceId}, skipping.`,
      );
    }

    this.logger.log(
      `Successfully added missing system fields to standard objects in workspace ${workspaceId}`,
    );
  }
}
