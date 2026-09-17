import { Command } from 'nest-commander';
import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  buildMissingSystemRelationIndexPlans,
  type MissingSystemRelationIndexPlan,
  type SystemRelationHolderNameSingular,
} from 'src/database/commands/upgrade-version-command/2-42/utils/build-missing-system-relation-index-plans.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

// Objects synced by applications before the objectSystemRelationsOnCreate
// handler minted indexes kept their target* legs on timelineActivity,
// attachment, noteTarget and taskTarget but never got the join column index,
// so every timeline or attachment read on those objects seq-scans the holder
// table. The 2-38 provisioning command skips them because both field legs
// already exist. Physical indexes are created CONCURRENTLY first so large
// holder tables keep accepting writes, then the migration persists the
// metadata and its CREATE INDEX IF NOT EXISTS finds them in place.
@RegisteredWorkspaceCommand('2.42.0', 1789663454000)
@Command({
  name: 'upgrade:2-42:backfill-missing-system-relation-indexes',
  description:
    'Create the missing join column index of app-owned target* system relation legs on timelineActivity, attachment, noteTarget and taskTarget. Indexes are created with CONCURRENTLY so writes are not blocked.',
})
export class BackfillMissingSystemRelationIndexesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const holderFlatObjectMetadataByNameSingular = {} as Record<
      SystemRelationHolderNameSingular,
      FlatObjectMetadata
    >;

    for (const holderNameSingular of DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS) {
      const holderFlatObjectMetadata =
        findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier:
            STANDARD_OBJECTS[holderNameSingular].universalIdentifier,
        });

      if (!isDefined(holderFlatObjectMetadata)) {
        this.logger.log(
          `Standard object ${holderNameSingular} does not exist for workspace ${workspaceId}, skipping`,
        );

        return;
      }

      holderFlatObjectMetadataByNameSingular[holderNameSingular] =
        holderFlatObjectMetadata;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const plans = buildMissingSystemRelationIndexPlans({
      flatFieldMetadataMaps,
      flatIndexMaps,
      holderFlatObjectMetadataByNameSingular,
      twentyStandardApplicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      now: new Date().toISOString(),
    });

    if (plans.length === 0) {
      this.logger.log(
        `System relation indexes already present for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const queryRunner = dataSource.createQueryRunner();
    let isQueryRunnerConnected = false;
    const createdPlans: MissingSystemRelationIndexPlan[] = [];

    try {
      await queryRunner.connect();
      isQueryRunnerConnected = true;

      for (const plan of plans) {
        const { schemaName, tableName } = getWorkspaceSchemaContextForMigration(
          {
            workspaceId,
            objectMetadata: plan.holderFlatObjectMetadata,
          },
        );

        const existingColumns = await dataSource.query<{ exists: 1 }[]>(
          `SELECT 1 AS "exists" FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 AND column_name = $3`,
          [schemaName, tableName, plan.joinColumnName],
        );

        if (existingColumns.length === 0) {
          this.logger.error(
            `MANUAL REPAIR REQUIRED: column ${tableName}.${plan.joinColumnName} is missing in workspace ${workspaceId}, cannot index it`,
          );
          continue;
        }

        if (isDryRun) {
          this.logger.log(
            `[DRY RUN] Would create index ${plan.universalFlatIndexMetadata.name} on ${tableName}(${plan.joinColumnName}) for workspace ${workspaceId}`,
          );
          continue;
        }

        await this.workspaceSchemaManagerService.indexManager.createIndex({
          queryRunner,
          schemaName,
          tableName,
          index: {
            name: plan.universalFlatIndexMetadata.name,
            columns: [plan.joinColumnName],
            isUnique: plan.universalFlatIndexMetadata.isUnique,
            type: plan.universalFlatIndexMetadata.indexType,
          },
          concurrently: true,
        });

        createdPlans.push(plan);

        this.logger.log(
          `Created index ${plan.universalFlatIndexMetadata.name} on ${tableName}(${plan.joinColumnName}) for workspace ${workspaceId}`,
        );
      }
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }

    if (createdPlans.length === 0) {
      return;
    }

    const plansByApplicationUniversalIdentifier = new Map<
      string,
      MissingSystemRelationIndexPlan[]
    >();

    for (const plan of createdPlans) {
      const { applicationUniversalIdentifier } =
        plan.universalFlatIndexMetadata;

      plansByApplicationUniversalIdentifier.set(applicationUniversalIdentifier, [
        ...(plansByApplicationUniversalIdentifier.get(
          applicationUniversalIdentifier,
        ) ?? []),
        plan,
      ]);
    }

    for (const [
      applicationUniversalIdentifier,
      applicationPlans,
    ] of plansByApplicationUniversalIdentifier) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            isSystemBuild: true,
            workspaceId,
            applicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName: {
              index: {
                flatEntityToCreate: applicationPlans.map(
                  ({ universalFlatIndexMetadata }) =>
                    universalFlatIndexMetadata,
                ),
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
          },
        );

      if (result.status === 'fail') {
        throw new Error(
          `Failed to persist system relation index metadata for application ${applicationUniversalIdentifier} in workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
        );
      }
    }

    this.logger.log(
      `Backfilled ${createdPlans.length} system relation index(es) for workspace ${workspaceId}`,
    );
  }
}
