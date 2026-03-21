import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ADD_MISSING_SYSTEM_FIELDS_TO_STANDARD_OBJECTS_1771420702241 } from 'src/database/commands/upgrade-version-command/workspace-migrations/1771420702241-add-missing-system-fields-to-standard-objects';
import { WorkspaceMigrationRunnerException } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration.type';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const { applicationUniversalIdentifier, actions: allActions } =
  ADD_MISSING_SYSTEM_FIELDS_TO_STANDARD_OBJECTS_1771420702241;

const NON_TS_VECTOR_MIGRATION: WorkspaceMigration = {
  applicationUniversalIdentifier,
  actions: allActions.filter(
    (action) => action.flatEntity.type !== FieldMetadataType.TS_VECTOR,
  ),
};

const TS_VECTOR_INDIVIDUAL_MIGRATIONS = allActions
  .filter((action) => action.flatEntity.type === FieldMetadataType.TS_VECTOR)
  .map((action) => ({
    universalIdentifier: action.flatEntity.universalIdentifier,
    fieldName: action.flatEntity.name,
    objectIdentifier: action.flatEntity.objectMetadataUniversalIdentifier,
    migration: {
      applicationUniversalIdentifier,
      actions: [action],
    } satisfies WorkspaceMigration,
  }));

const NON_TS_VECTOR_INDIVIDUAL_MIGRATIONS = allActions
  .filter((action) => action.flatEntity.type !== FieldMetadataType.TS_VECTOR)
  .map((action) => ({
    universalIdentifier: action.flatEntity.universalIdentifier,
    fieldName: action.flatEntity.name,
    objectIdentifier: action.flatEntity.objectMetadataUniversalIdentifier,
    migration: {
      applicationUniversalIdentifier,
      actions: [action],
    } satisfies WorkspaceMigration,
  }));

const FIRST_NON_TS_VECTOR_UNIVERSAL_IDENTIFIER =
  allActions[0].flatEntity.universalIdentifier;

const DUPLICATE_KEY_MESSAGE = 'duplicate key value violates unique constraint';

const getNestedErrorMessages = (
  error: WorkspaceMigrationRunnerException,
): string | undefined => {
  const nestedErrors = error.errors;

  if (!isDefined(nestedErrors)) {
    return undefined;
  }

  const details = [
    nestedErrors.metadata && `metadata: ${nestedErrors.metadata.message}`,
    nestedErrors.workspaceSchema &&
      `workspaceSchema: ${nestedErrors.workspaceSchema.message}`,
    nestedErrors.actionTranspilation &&
      `actionTranspilation: ${nestedErrors.actionTranspilation.message}`,
  ]
    .filter(isDefined)
    .join('; ');

  return details || undefined;
};

const isUniqueViolationError = (error: Error): boolean => {
  if (error.message.includes(DUPLICATE_KEY_MESSAGE)) {
    return true;
  }

  if (error instanceof WorkspaceMigrationRunnerException) {
    const nestedMessages = getNestedErrorMessages(error);

    return nestedMessages?.includes(DUPLICATE_KEY_MESSAGE) === true;
  }

  return false;
};

const enrichErrorMessage = (error: Error): Error => {
  if (!(error instanceof WorkspaceMigrationRunnerException)) {
    return error;
  }

  const details = getNestedErrorMessages(error);

  if (isDefined(details)) {
    error.message = `${error.message} (${details})`;
  }

  return error;
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

  private async runIndividualMigrations(
    workspaceId: string,
    migrations: {
      universalIdentifier: string;
      fieldName: string;
      objectIdentifier: string;
      migration: WorkspaceMigration;
    }[],
  ): Promise<void> {
    for (const entry of migrations) {
      const alreadyCreated = await this.hasFieldBeenCreated(
        workspaceId,
        entry.universalIdentifier,
      );

      if (alreadyCreated) {
        continue;
      }

      this.logger.log(
        `Adding field ${entry.fieldName} on object ${entry.objectIdentifier} in workspace ${workspaceId}`,
      );

      try {
        await this.workspaceMigrationRunnerService.run({
          workspaceId,
          workspaceMigration: entry.migration,
        });
      } catch (error) {
        if (!isUniqueViolationError(error)) {
          throw enrichErrorMessage(error);
        }

        this.logger.warn(
          `Field ${entry.fieldName} on object ${entry.objectIdentifier} already exists in workspace ${workspaceId}, skipping`,
        );
      }
    }
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
        `[DRY RUN] Would add ${NON_TS_VECTOR_MIGRATION.actions.length} non-tsVector fields and ${TS_VECTOR_INDIVIDUAL_MIGRATIONS.length} tsVector fields to standard objects in workspace ${workspaceId}. Skipping.`,
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

      try {
        await this.workspaceMigrationRunnerService.run({
          workspaceId,
          workspaceMigration: NON_TS_VECTOR_MIGRATION,
        });
      } catch (error) {
        if (!isUniqueViolationError(error)) {
          throw enrichErrorMessage(error);
        }

        this.logger.warn(
          `Batch non-tsVector migration hit a duplicate field in workspace ${workspaceId}, falling back to individual field migrations`,
        );

        await this.runIndividualMigrations(
          workspaceId,
          NON_TS_VECTOR_INDIVIDUAL_MIGRATIONS,
        );
      }
    } else {
      this.logger.log(
        `Non-tsVector fields already exist in workspace ${workspaceId}, skipping.`,
      );
    }

    await this.runIndividualMigrations(
      workspaceId,
      TS_VECTOR_INDIVIDUAL_MIGRATIONS,
    );

    this.logger.log(
      `Successfully added missing system fields to standard objects in workspace ${workspaceId}`,
    );
  }
}
