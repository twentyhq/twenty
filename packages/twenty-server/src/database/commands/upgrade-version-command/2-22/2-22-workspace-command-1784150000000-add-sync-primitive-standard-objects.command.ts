import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const SYNC_OBJECT_NAMES = [
  'externalEntityLink',
  'externalSyncOutbox',
  'externalSyncInbox',
  'externalSyncDLQ',
  'externalSyncCheckpoint',
  'externalSyncReconciliation',
] as const satisfies (keyof typeof STANDARD_OBJECTS)[];

const SYNC_OBJECTS = SYNC_OBJECT_NAMES.map(
  (name) => STANDARD_OBJECTS[name],
);

const SYNC_OBJECT_UNIVERSAL_IDENTIFIERS = SYNC_OBJECTS.map(
  (obj) => obj.universalIdentifier,
);

const SYNC_FIELD_UNIVERSAL_IDENTIFIERS = SYNC_OBJECTS.flatMap((obj) =>
  Object.values(obj.fields).map((f) => f.universalIdentifier),
);

const SYNC_INDEX_UNIVERSAL_IDENTIFIERS = SYNC_OBJECTS.flatMap((obj) =>
  Object.values(obj.indexes).map((i) => i.universalIdentifier),
);

@RegisteredWorkspaceCommand('2.22.0', 1784150000000)
@Command({
  name: 'upgrade:2-22:add-sync-primitive-standard-objects',
  description:
    'Add the 6 sync primitive standard objects (externalEntityLink, externalSyncOutbox, externalSyncInbox, externalSyncDLQ, externalSyncCheckpoint, externalSyncReconciliation) to existing workspaces',
})
export class AddSyncPrimitiveStandardObjectsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `Checking sync primitive standard objects for workspace ${workspaceId}`,
    );

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
    ]);

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const now = new Date().toISOString();

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now,
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const objectMetadataToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatObjectMetadata>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatObjectMetadataMaps,
        existingFlatEntityMaps: flatObjectMetadataMaps,
        universalIdentifiers: SYNC_OBJECT_UNIVERSAL_IDENTIFIERS,
      });

    if (objectMetadataToCreate.length === 0) {
      this.logger.log(
        `Sync primitive standard objects already exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const allFlatEntityOperationByMetadataName = {
      objectMetadata: {
        flatEntityToCreate: objectMetadataToCreate,
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      fieldMetadata: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatFieldMetadataMaps,
            existingFlatEntityMaps: flatFieldMetadataMaps,
            universalIdentifiers: SYNC_FIELD_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      index: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
            standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
            existingFlatEntityMaps: flatIndexMaps,
            universalIdentifiers: SYNC_INDEX_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
    };

    const totalCreateCount = Object.values(
      allFlatEntityOperationByMetadataName,
    ).reduce(
      (total, operations) => total + operations.flatEntityToCreate.length,
      0,
    );

    if (totalCreateCount === 0) {
      this.logger.log(
        `Sync primitive standard objects already fully exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${totalCreateCount} sync primitive standard metadata entities (${objectMetadataToCreate.length} objects, ${allFlatEntityOperationByMetadataName.fieldMetadata.flatEntityToCreate.length} fields, ${allFlatEntityOperationByMetadataName.index.flatEntityToCreate.length} indexes) for workspace ${workspaceId}`,
      );

      return;
    }

    await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
      {
        isSystemBuild: true,
        applicationUniversalIdentifier:
          twentyStandardFlatApplication.universalIdentifier,
        workspaceId,
        allFlatEntityOperationByMetadataName,
      },
    );

    this.logger.log(
      `Created ${totalCreateCount} sync primitive standard metadata entities for workspace ${workspaceId}`,
    );
  }
}
