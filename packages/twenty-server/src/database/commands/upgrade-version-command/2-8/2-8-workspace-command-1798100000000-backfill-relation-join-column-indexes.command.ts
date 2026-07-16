import { Command } from 'nest-commander';
import { DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS } from 'twenty-shared/metadata';
import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { generateIndexForFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-index-for-flat-field-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const POLYMORPHIC_STANDARD_OBJECT_NAMES_SINGULAR: ReadonlySet<string> = new Set(
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
);

@RegisteredWorkspaceCommand('2.8.0', 1798100000000)
@Command({
  name: 'upgrade:2-8:backfill-relation-join-column-indexes',
  description:
    'Backfill missing BTREE indexes on target<X>Id join columns added to polymorphic standard objects (timelineActivity, attachment, noteTarget, taskTarget) when custom objects were created before the auto-index fix. Indexes are created with CONCURRENTLY so writes are not blocked.',
})
export class BackfillRelationJoinColumnIndexesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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

    if (!dataSource) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const polymorphicStandardObjectIds = new Set(
      Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter((flatObject) =>
          POLYMORPHIC_STANDARD_OBJECT_NAMES_SINGULAR.has(
            flatObject.nameSingular,
          ),
        )
        .map((flatObject) => flatObject.id),
    );

    if (polymorphicStandardObjectIds.size === 0) {
      this.logger.log(
        `No polymorphic standard objects found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const indexedFieldIds = new Set<string>();

    for (const flatIndex of Object.values(
      flatIndexMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatIndex)) {
        continue;
      }

      for (const indexField of flatIndex.flatIndexFieldMetadatas) {
        indexedFieldIds.add(indexField.fieldMetadataId);
      }
    }

    const fieldsNeedingIndex = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(isMorphOrRelationFlatFieldMetadata)
      .filter((flatField) =>
        polymorphicStandardObjectIds.has(flatField.objectMetadataId),
      )
      .filter(
        (flatField) =>
          flatField.settings?.relationType === RelationType.MANY_TO_ONE,
      )
      .filter((flatField) => !indexedFieldIds.has(flatField.id));

    if (fieldsNeedingIndex.length === 0) {
      this.logger.log(
        `No missing relation join column indexes for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const flatIndexBuildPlans = fieldsNeedingIndex.map((flatField) => {
      const flatObjectMetadata =
        findFlatEntityByIdInFlatEntityMapsOrThrow<FlatObjectMetadata>({
          flatEntityId: flatField.objectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        });

      const universalFlatIndexMetadata = generateIndexForFlatFieldMetadata({
        flatFieldMetadata: flatField,
        flatObjectMetadata,
      });

      const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
        name: flatField.name,
      });

      return {
        flatObjectMetadata,
        universalFlatIndexMetadata,
        joinColumnName,
      };
    });

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Found ${flatIndexBuildPlans.length} missing relation join column index(es) for workspace ${workspaceId}: ${flatIndexBuildPlans.map(({ universalFlatIndexMetadata }) => universalFlatIndexMetadata.name).join(', ')}`,
    );

    if (isDryRun) {
      return;
    }

    const queryRunner = dataSource.createQueryRunner();
    let isQueryRunnerConnected = false;

    try {
      await queryRunner.connect();
      isQueryRunnerConnected = true;

      for (const {
        flatObjectMetadata,
        universalFlatIndexMetadata,
        joinColumnName,
      } of flatIndexBuildPlans) {
        const { schemaName, tableName } = getWorkspaceSchemaContextForMigration(
          {
            workspaceId,
            objectMetadata: flatObjectMetadata,
          },
        );

        await this.workspaceSchemaManagerService.indexManager.createIndex({
          queryRunner,
          schemaName,
          tableName,
          index: {
            name: universalFlatIndexMetadata.name,
            columns: [joinColumnName],
            isUnique: universalFlatIndexMetadata.isUnique,
            type: universalFlatIndexMetadata.indexType,
            where: universalFlatIndexMetadata.indexWhereClause ?? undefined,
          },
          concurrently: true,
        });

        this.logger.log(
          `Created index ${universalFlatIndexMetadata.name} on workspace ${workspaceId}`,
        );
      }
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          allFlatEntityOperationByMetadataName: {
            index: {
              flatEntityToCreate: flatIndexBuildPlans.map(
                ({ universalFlatIndexMetadata }) => universalFlatIndexMetadata,
              ),
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to persist relation join column index metadata:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to persist relation join column index metadata for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully backfilled ${flatIndexBuildPlans.length} relation join column index(es) for workspace ${workspaceId}`,
    );
  }
}
