import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { getIndexUniversalIdentifier } from 'twenty-shared/application';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { generateDeterministicIndexForFlatFieldMetadataOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-deterministic-index-for-flat-field-metadata-or-throw.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { isPrimaryKeyFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-primary-key-flat-field-metadata.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

type IndexOperations = {
  flatEntityToCreate: UniversalFlatIndexMetadata[];
  flatEntityToDelete: FlatIndexMetadata[];
};

@RegisteredWorkspaceCommand('2.58.0', 1794325816486)
@Command({
  name: 'upgrade:2-58:exclude-deleted-records-from-unique-field-indexes',
  description:
    'Replace the index backing each unique field with a partial index on non-deleted records',
})
export class ExcludeDeletedRecordsFromUniqueFieldIndexesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const indexOperationsByApplicationUniversalIdentifier = new Map<
      string,
      IndexOperations
    >();
    const getIndexOperations = (applicationUniversalIdentifier: string) => {
      const indexOperations =
        indexOperationsByApplicationUniversalIdentifier.get(
          applicationUniversalIdentifier,
        ) ?? { flatEntityToCreate: [], flatEntityToDelete: [] };

      indexOperationsByApplicationUniversalIdentifier.set(
        applicationUniversalIdentifier,
        indexOperations,
      );

      return indexOperations;
    };

    for (const legacyFlatIndexMetadata of Object.values(
      flatIndexMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(legacyFlatIndexMetadata) ||
        !legacyFlatIndexMetadata.isUnique ||
        isNonEmptyString(legacyFlatIndexMetadata.indexWhereClause) ||
        legacyFlatIndexMetadata.flatIndexFieldMetadatas.length !== 1
      ) {
        continue;
      }

      const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId:
          legacyFlatIndexMetadata.flatIndexFieldMetadatas[0].fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });
      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: legacyFlatIndexMetadata.objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (
        !isDefined(flatFieldMetadata) ||
        !isDefined(flatObjectMetadata) ||
        flatFieldMetadata.isUnique !== true ||
        isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) ||
        isPrimaryKeyFlatFieldMetadata(flatFieldMetadata)
      ) {
        continue;
      }

      // Only indexes owned by the field's isUnique flag carry this identifier.
      // Unique indexes declared on their own (dedupe hashes, provider ids)
      // have a declared one and keep covering deleted records.
      const isOwnedByUniqueField =
        legacyFlatIndexMetadata.universalIdentifier ===
        getIndexUniversalIdentifier({
          applicationUniversalIdentifier:
            flatFieldMetadata.applicationUniversalIdentifier,
          objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
          name: legacyFlatIndexMetadata.name,
        });

      if (!isOwnedByUniqueField) {
        continue;
      }

      const replacementFlatIndexMetadata =
        generateDeterministicIndexForFlatFieldMetadataOrThrow({
          flatFieldMetadata,
          flatObjectMetadata,
        });

      getIndexOperations(
        legacyFlatIndexMetadata.applicationUniversalIdentifier,
      ).flatEntityToDelete.push(legacyFlatIndexMetadata);

      if (
        !isDefined(
          flatIndexMaps.byUniversalIdentifier[
            replacementFlatIndexMetadata.universalIdentifier
          ],
        )
      ) {
        getIndexOperations(
          replacementFlatIndexMetadata.applicationUniversalIdentifier,
        ).flatEntityToCreate.push(replacementFlatIndexMetadata);
      }
    }

    for (const [
      applicationUniversalIdentifier,
      indexOperations,
    ] of indexOperationsByApplicationUniversalIdentifier) {
      const indexNames = [
        ...indexOperations.flatEntityToDelete,
        ...indexOperations.flatEntityToCreate,
      ]
        .map(({ name }) => name)
        .join(', ');

      if (options.dryRun) {
        this.logger.log(
          `[DRY RUN] Would replace unique field indexes for workspace ${workspaceId}: ${indexNames}`,
        );
        continue;
      }

      const migrationArgs = {
        shouldDeferActions: false,
        isSystemBuild: true,
        applicationUniversalIdentifier,
        workspaceId,
        allFlatEntityOperationByMetadataName: {
          index: { ...indexOperations, flatEntityToUpdate: [] },
        },
      };

      // Twenty standard metadata must not go through the side-effect engine, see docs/UPGRADE_COMMANDS.md
      const result =
        applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              migrationArgs,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              migrationArgs,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          doNotTranslate(
            `Failed to replace unique field indexes for workspace ${workspaceId}`,
          ),
        );
      }

      this.logger.log(
        `Replaced unique field indexes for workspace ${workspaceId}: ${indexNames}`,
      );
    }
  }
}
