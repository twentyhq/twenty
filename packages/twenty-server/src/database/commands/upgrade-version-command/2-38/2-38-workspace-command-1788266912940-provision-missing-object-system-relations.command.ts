import { Command } from 'nest-commander';
import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  buildMissingObjectSystemRelationCandidates,
  type DefaultRelationHolderNameSingular,
  type MissingObjectSystemRelationCandidate,
} from 'src/database/commands/upgrade-version-command/2-38/utils/build-missing-object-system-relation-candidates.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  buildSystemRelationFlatFieldMetadatasForObject,
  type SystemRelationFlatFieldMetadataBundle,
} from 'src/engine/metadata-modules/object-metadata/utils/build-system-relation-flat-field-metadatas-for-object.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

@RegisteredWorkspaceCommand('2.38.0', 1788266912940)
@Command({
  name: 'upgrade:2-38:provision-missing-object-system-relations',
  description:
    'Provision the default system-relation pairs (forward relation field on the object, target* morph leg on timelineActivity/attachment/noteTarget/taskTarget, join-column index) for non-standard objects that lost them, typically to pre-2.20 application syncs. The 2-35 restore command only recreated the pairs twenty-standard authors for its own objects; pairs of custom or app-installed objects were never restored, so runtime writes deriving the join column from the object name throw UNKNOWN_COLUMN on every event (Sentry TWENTY-SERVER-JRV). Mints exactly what the objectSystemRelationsOnCreate handler mints at object creation, only for pairs where both legs are absent, and reports pairs it cannot complete safely (partial pair, taken field name, surviving physical column) instead of guessing.',
})
export class ProvisionMissingObjectSystemRelationsCommand extends ProvisionedWorkspaceCommandRunner {
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
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const holderFlatObjectMetadataByNameSingular = {} as Record<
      DefaultRelationHolderNameSingular,
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

    if (!isDefined(dataSource)) {
      this.logger.error(
        `Cannot verify system relation columns for workspace ${workspaceId}: no data source. Skipping, rerun once the workspace is reachable.`,
      );

      return;
    }

    const existingColumnNamesByHolderNameSingular =
      await this.readExistingColumnNamesByHolder({
        dataSource,
        workspaceId,
        holderFlatObjectMetadataByNameSingular,
      });

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { candidates, unprovisionableSystemRelations } =
      buildMissingObjectSystemRelationCandidates({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        holderFlatObjectMetadataByNameSingular,
        existingColumnNamesByHolderNameSingular,
        twentyStandardApplicationUniversalIdentifier:
          twentyStandardFlatApplication.universalIdentifier,
      });

    if (unprovisionableSystemRelations.length > 0) {
      this.logger.error(
        [
          `MANUAL REPAIR REQUIRED: ${unprovisionableSystemRelations.length} system relation(s) in workspace ${workspaceId} cannot be provisioned automatically:`,
          ...unprovisionableSystemRelations.map(
            ({ sourceObjectNameSingular, holderNameSingular, reason }) =>
              `  - ${sourceObjectNameSingular} <-> ${holderNameSingular}: ${reason}`,
          ),
        ].join('\n'),
      );
    }

    if (candidates.length === 0) {
      if (unprovisionableSystemRelations.length === 0) {
        this.logger.log(
          `Object system relations are complete for workspace ${workspaceId}, skipping`,
        );
      }

      return;
    }

    const totalPairCount = candidates.reduce(
      (count, candidate) => count + candidate.missingHolderNameSingulars.length,
      0,
    );

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Provisioning ${totalPairCount} missing system relation pair(s) across ${candidates.length} object(s) for workspace ${workspaceId}: ${candidates
        .map(
          ({ sourceFlatObjectMetadata, missingHolderNameSingulars }) =>
            `${sourceFlatObjectMetadata.nameSingular} (${missingHolderNameSingulars.join(', ')})`,
        )
        .join('; ')}`,
    );

    if (isDryRun) {
      return;
    }

    const candidatesByApplicationUniversalIdentifier = new Map<
      string,
      MissingObjectSystemRelationCandidate[]
    >();

    for (const candidate of candidates) {
      const { applicationUniversalIdentifier } =
        candidate.sourceFlatObjectMetadata;
      const existing =
        candidatesByApplicationUniversalIdentifier.get(
          applicationUniversalIdentifier,
        ) ?? [];

      existing.push(candidate);
      candidatesByApplicationUniversalIdentifier.set(
        applicationUniversalIdentifier,
        existing,
      );
    }

    for (const [
      applicationUniversalIdentifier,
      applicationCandidates,
    ] of candidatesByApplicationUniversalIdentifier) {
      const bundlesToCreate = applicationCandidates.flatMap((candidate) =>
        this.buildBundlesForCandidate({
          candidate,
          holderFlatObjectMetadataByNameSingular,
        }),
      );

      const indexesToCreate = bundlesToCreate
        .map(({ flatIndexMetadata }) => flatIndexMetadata)
        .filter(
          (flatIndexMetadata) =>
            !isDefined(
              flatIndexMaps.byUniversalIdentifier[
                flatIndexMetadata.universalIdentifier
              ],
            ),
        );

      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            isSystemBuild: true,
            workspaceId,
            applicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName: {
              fieldMetadata: {
                flatEntityToCreate: bundlesToCreate.flatMap(
                  ({ forwardFlatFieldMetadata, reverseFlatFieldMetadata }) => [
                    forwardFlatFieldMetadata,
                    reverseFlatFieldMetadata,
                  ],
                ),
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
              index: {
                flatEntityToCreate: indexesToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
          },
        );

      if (result.status === 'fail') {
        throw new Error(
          `Failed to provision system relations for application ${applicationUniversalIdentifier} in workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
        );
      }
    }

    this.logger.log(
      `Provisioned ${totalPairCount} system relation pair(s) for workspace ${workspaceId}`,
    );
  }

  private buildBundlesForCandidate({
    candidate,
    holderFlatObjectMetadataByNameSingular,
  }: {
    candidate: MissingObjectSystemRelationCandidate;
    holderFlatObjectMetadataByNameSingular: Record<
      DefaultRelationHolderNameSingular,
      FlatObjectMetadata
    >;
  }): SystemRelationFlatFieldMetadataBundle[] {
    const allBundles = buildSystemRelationFlatFieldMetadatasForObject({
      sourceFlatObjectMetadata: candidate.sourceFlatObjectMetadata,
      standardTargetFlatObjectMetadataByNameSingular:
        holderFlatObjectMetadataByNameSingular,
      applicationUniversalIdentifier:
        candidate.sourceFlatObjectMetadata.applicationUniversalIdentifier,
    });

    const missingHolderUniversalIdentifiers = new Set(
      candidate.missingHolderNameSingulars.map(
        (holderNameSingular) =>
          holderFlatObjectMetadataByNameSingular[holderNameSingular]
            .universalIdentifier,
      ),
    );

    return allBundles.filter(({ reverseFlatFieldMetadata }) =>
      missingHolderUniversalIdentifiers.has(
        reverseFlatFieldMetadata.objectMetadataUniversalIdentifier,
      ),
    );
  }

  private async readExistingColumnNamesByHolder({
    dataSource,
    workspaceId,
    holderFlatObjectMetadataByNameSingular,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    holderFlatObjectMetadataByNameSingular: Record<
      DefaultRelationHolderNameSingular,
      FlatObjectMetadata
    >;
  }): Promise<Record<DefaultRelationHolderNameSingular, Set<string>>> {
    const existingColumnNamesByHolderNameSingular = {} as Record<
      DefaultRelationHolderNameSingular,
      Set<string>
    >;

    for (const holderNameSingular of DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS) {
      const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
        workspaceId,
        objectMetadata:
          holderFlatObjectMetadataByNameSingular[holderNameSingular],
      });

      const rows = await dataSource.query<{ column_name: string }[]>(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2`,
        [schemaName, tableName],
      );

      existingColumnNamesByHolderNameSingular[holderNameSingular] = new Set(
        rows.map(({ column_name }) => column_name),
      );
    }

    return existingColumnNamesByHolderNameSingular;
  }
}
