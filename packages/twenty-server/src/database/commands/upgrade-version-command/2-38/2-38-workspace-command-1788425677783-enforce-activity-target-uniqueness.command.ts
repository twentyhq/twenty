import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { buildDuplicateActivityTargetQuery } from 'src/database/commands/upgrade-version-command/2-38/utils/build-duplicate-activity-target-query.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const ACTIVITY_TARGET_CONFIGS = [
  { tableName: 'taskTarget', parentColumnName: 'taskId' },
  { tableName: 'noteTarget', parentColumnName: 'noteId' },
] as const;

const ACTIVITY_TARGET_UNIQUE_INDEX_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.taskTarget.indexes.taskPersonUniqueIndex.universalIdentifier,
  STANDARD_OBJECTS.taskTarget.indexes.taskCompanyUniqueIndex
    .universalIdentifier,
  STANDARD_OBJECTS.taskTarget.indexes.taskOpportunityUniqueIndex
    .universalIdentifier,
  STANDARD_OBJECTS.noteTarget.indexes.notePersonUniqueIndex.universalIdentifier,
  STANDARD_OBJECTS.noteTarget.indexes.noteCompanyUniqueIndex
    .universalIdentifier,
  STANDARD_OBJECTS.noteTarget.indexes.noteOpportunityUniqueIndex
    .universalIdentifier,
];

@RegisteredWorkspaceCommand('2.38.0', 1788425677783)
@Command({
  name: 'upgrade:2-38:enforce-activity-target-uniqueness',
  description:
    'Remove duplicate task/note targets and add their missing unique indexes',
})
export class EnforceActivityTargetUniquenessCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.warn(
        `Skipping activity target uniqueness for workspace ${workspaceId}: no workspace data source`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const [provisionedTables] = await dataSource.query<
      Array<{ taskTarget: string | null; noteTarget: string | null }>
    >(
      `SELECT
        to_regclass($1) AS "taskTarget",
        to_regclass($2) AS "noteTarget"`,
      [`"${schemaName}"."taskTarget"`, `"${schemaName}"."noteTarget"`],
    );

    if (
      !isDefined(provisionedTables?.taskTarget) ||
      !isDefined(provisionedTables.noteTarget)
    ) {
      this.logger.warn(
        `Skipping activity target uniqueness for workspace ${workspaceId}: target tables are not provisioned`,
      );

      return;
    }

    let duplicateCount = 0;

    for (const targetConfig of ACTIVITY_TARGET_CONFIGS) {
      const [result] = await dataSource.query<Array<{ count: number }>>(
        buildDuplicateActivityTargetQuery({
          schemaName,
          ...targetConfig,
          deleteDuplicates: !options.dryRun,
        }),
      );

      duplicateCount += result?.count ?? 0;
    }

    const { flatIndexMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatIndexMaps'],
    );
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });
    const indexesToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
        existingFlatEntityMaps: flatIndexMaps,
        universalIdentifiers:
          ACTIVITY_TARGET_UNIQUE_INDEX_UNIVERSAL_IDENTIFIERS,
      });

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] Would remove' : 'Removed'} ${duplicateCount} duplicate activity target(s) and ${options.dryRun ? 'would create' : 'will create'} ${indexesToCreate.length} unique index(es) for workspace ${workspaceId}`,
    );

    if (options.dryRun || indexesToCreate.length === 0) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            index: {
              flatEntityToCreate: indexesToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
