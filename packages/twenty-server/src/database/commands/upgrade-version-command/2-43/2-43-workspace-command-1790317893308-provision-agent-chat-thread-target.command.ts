import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { findObjectsMissingAgentChatThreadTargetRelation } from 'src/database/commands/upgrade-version-command/2-43/utils/find-objects-missing-agent-chat-thread-target-relation.util';
import { getAgentChatThreadTargetSchemaAdditions } from 'src/database/commands/upgrade-version-command/2-43/utils/get-agent-chat-thread-target-schema-additions.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildSystemRelationFlatFieldMetadatasForObject } from 'src/engine/metadata-modules/object-metadata/utils/build-system-relation-flat-field-metadatas-for-object.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

// The standard application is synchronized only when a workspace is created, so
// declaring agentChatThreadTarget in STANDARD_OBJECTS leaves every existing
// workspace without the table. This provisions it the same way agent history
// provisioned its five objects: an additive from/to migration over the standard
// definitions, which custom-object side effects must not expand. Objects created
// before it then get the relation their creation would give them today.
@RegisteredWorkspaceCommand('2.43.0', 1790317893308)
@Command({
  name: 'upgrade:2-43:provision-agent-chat-thread-target',
  description:
    'Create the agentChatThreadTarget object, its fields and its indexes for existing workspaces, then give every non-standard object the agentChatThreadTarget relation pair object creation now mints (forward relation field, target* morph leg, join-column index), reporting pairs it cannot complete safely instead of guessing',
})
export class ProvisionAgentChatThreadTargetCommand extends ProvisionedWorkspaceCommandRunner {
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
    const dryRun = options.dryRun ?? false;

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const hasAgentChatThreadTarget = await this.provisionStandardSchema({
      workspaceId,
      dryRun,
      twentyStandardFlatApplication,
    });

    if (!hasAgentChatThreadTarget) {
      return;
    }

    await this.provisionObjectRelations({
      workspaceId,
      dataSource,
      dryRun,
      twentyStandardApplicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
    });
  }

  // Returns whether agentChatThreadTarget exists afterwards; a dry run never
  // creates it.
  private async provisionStandardSchema({
    workspaceId,
    dryRun,
    twentyStandardFlatApplication,
  }: {
    workspaceId: string;
    dryRun: boolean;
    twentyStandardFlatApplication: FlatApplication;
  }): Promise<boolean> {
    // The migration builder mutates its optimistic maps, even on dry runs.
    // Keep those changes out of the live metadata cache until DDL succeeds.
    const existing = structuredClone(
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
        'featureFlagsMap',
      ]),
    );

    const hasThreadObject = isDefined(
      existing.flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ],
    );

    if (!hasThreadObject) {
      // The agent history migration earlier in this segment skips workspaces
      // with no schema; provisioning one syncs the whole standard application,
      // which creates agentChatThreadTarget and every relation leg.
      this.logger.log(
        `Workspace ${workspaceId} has no agentChatThread, skipping; workspace provisioning creates agentChatThreadTarget`,
      );

      return false;
    }

    const {
      allFlatEntityMaps: standard,
      idByUniversalIdentifierByMetadataName,
    } = computeTwentyStandardApplicationAllFlatEntityMaps({
      now: new Date().toISOString(),
      workspaceId,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
    });

    const { objects, fields, indexes } =
      getAgentChatThreadTargetSchemaAdditions({ existing, standard });

    if (objects.length + fields.length + indexes.length === 0) {
      return true;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
        {
          workspaceId,
          dryRun,
          buildOptions: {
            isSystemBuild: true,
            inferDeletionFromMissingEntities: {},
            applicationUniversalIdentifier:
              twentyStandardFlatApplication.universalIdentifier,
          },
          additionalCacheDataMaps: {
            featureFlagsMap: existing.featureFlagsMap,
          },
          idByUniversalIdentifierByMetadataName,
          fromToAllFlatEntityMaps: {
            flatObjectMetadataMaps: {
              from: existing.flatObjectMetadataMaps,
              to: objects.reduce(
                (maps, flatEntity) =>
                  addFlatEntityToFlatEntityMapsOrThrow({
                    flatEntityMaps: maps,
                    flatEntity,
                  }),
                existing.flatObjectMetadataMaps,
              ),
            },
            flatFieldMetadataMaps: {
              from: existing.flatFieldMetadataMaps,
              to: fields.reduce(
                (maps, flatEntity) =>
                  addFlatEntityToFlatEntityMapsOrThrow({
                    flatEntityMaps: maps,
                    flatEntity,
                  }),
                existing.flatFieldMetadataMaps,
              ),
            },
            flatIndexMaps: {
              from: existing.flatIndexMaps,
              to: indexes.reduce(
                (maps, flatEntity) =>
                  addFlatEntityToFlatEntityMapsOrThrow({
                    flatEntityMaps: maps,
                    flatEntity,
                  }),
                existing.flatIndexMaps,
              ),
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `agentChatThreadTarget provisioning failed for workspace ${workspaceId}: ${JSON.stringify(
          result,
        )}`,
      );
    }

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId} would get ${objects.length} object(s), ${fields.length} field(s) and ${indexes.length} index(es) of agentChatThreadTarget; its relations to non-standard objects are resolved once it exists`,
      );

      return false;
    }

    return true;
  }

  private async provisionObjectRelations({
    workspaceId,
    dataSource,
    dryRun,
    twentyStandardApplicationUniversalIdentifier,
  }: {
    workspaceId: string;
    dataSource: DataSource | undefined;
    dryRun: boolean;
    twentyStandardApplicationUniversalIdentifier: string;
  }): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const targetFlatObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier,
      });

    if (!isDefined(targetFlatObjectMetadata)) {
      throw new Error(
        `agentChatThreadTarget is missing from workspace ${workspaceId} after provisioning`,
      );
    }

    if (!isDefined(dataSource)) {
      this.logger.error(
        `Cannot verify agentChatThreadTarget columns for workspace ${workspaceId}: no data source. Skipping its object relations, rerun once the workspace is reachable.`,
      );

      return;
    }

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: targetFlatObjectMetadata,
    });

    const columnRows = await dataSource.query<{ column_name: string }[]>(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2`,
      [schemaName, tableName],
    );

    const { flatObjectMetadatas, unprovisionableRelations } =
      findObjectsMissingAgentChatThreadTargetRelation({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        targetFlatObjectMetadata,
        existingTargetColumnNames: new Set(
          columnRows.map(({ column_name }) => column_name),
        ),
        twentyStandardApplicationUniversalIdentifier,
      });

    if (unprovisionableRelations.length > 0) {
      this.logger.error(
        [
          `MANUAL REPAIR REQUIRED: ${unprovisionableRelations.length} agentChatThreadTarget relation(s) in workspace ${workspaceId} cannot be provisioned automatically:`,
          ...unprovisionableRelations.map(
            ({ objectNameSingular, reason }) =>
              `  - ${objectNameSingular} <-> agentChatThreadTarget: ${reason}`,
          ),
        ].join('\n'),
      );
    }

    if (flatObjectMetadatas.length === 0) {
      if (unprovisionableRelations.length === 0) {
        this.logger.log(
          `agentChatThreadTarget relations are complete for workspace ${workspaceId}, skipping`,
        );
      }

      return;
    }

    this.logger.log(
      `${dryRun ? '[DRY RUN] ' : ''}Provisioning the agentChatThreadTarget relation of ${flatObjectMetadatas.length} object(s) for workspace ${workspaceId}: ${flatObjectMetadatas
        .map(({ nameSingular }) => nameSingular)
        .join(', ')}`,
    );

    if (dryRun) {
      return;
    }

    const flatObjectMetadatasByApplicationUniversalIdentifier = new Map<
      string,
      FlatObjectMetadata[]
    >();

    for (const flatObjectMetadata of flatObjectMetadatas) {
      const { applicationUniversalIdentifier } = flatObjectMetadata;

      flatObjectMetadatasByApplicationUniversalIdentifier.set(
        applicationUniversalIdentifier,
        [
          ...(flatObjectMetadatasByApplicationUniversalIdentifier.get(
            applicationUniversalIdentifier,
          ) ?? []),
          flatObjectMetadata,
        ],
      );
    }

    for (const [
      applicationUniversalIdentifier,
      applicationFlatObjectMetadatas,
    ] of flatObjectMetadatasByApplicationUniversalIdentifier) {
      const bundles = applicationFlatObjectMetadatas.flatMap(
        (sourceFlatObjectMetadata) =>
          buildSystemRelationFlatFieldMetadatasForObject({
            sourceFlatObjectMetadata,
            standardTargetFlatObjectMetadataByNameSingular: {
              agentChatThreadTarget: targetFlatObjectMetadata,
            },
            applicationUniversalIdentifier,
          }),
      );

      // These are exactly what objectSystemRelationsOnCreate emits when an
      // object is created, and side effects never expand the output of other
      // side effects, so the matrix is applied literally.
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            isSystemBuild: true,
            workspaceId,
            applicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName: {
              fieldMetadata: {
                flatEntityToCreate: bundles.flatMap(
                  ({ forwardFlatFieldMetadata, reverseFlatFieldMetadata }) => [
                    forwardFlatFieldMetadata,
                    reverseFlatFieldMetadata,
                  ],
                ),
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
              index: {
                flatEntityToCreate: bundles
                  .map(({ flatIndexMetadata }) => flatIndexMetadata)
                  .filter(
                    (flatIndexMetadata) =>
                      !isDefined(
                        flatIndexMaps.byUniversalIdentifier[
                          flatIndexMetadata.universalIdentifier
                        ],
                      ),
                  ),
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
          },
        );

      if (result.status === 'fail') {
        throw new Error(
          `Failed to provision agentChatThreadTarget relations for application ${applicationUniversalIdentifier} in workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
        );
      }
    }

    this.logger.log(
      `Provisioned the agentChatThreadTarget relation of ${flatObjectMetadatas.length} object(s) for workspace ${workspaceId}`,
    );
  }
}
