import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import {
  buildTargetFieldCollisionRenameUpdates,
  buildTargetObjectCollisionRenameUpdates,
} from 'src/database/commands/upgrade-version-command/2-37/utils/build-target-metadata-collision-renames.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const getUniversalIdentifiers = (
  entitiesByName: Record<string, { universalIdentifier: string }>,
) =>
  Object.values(entitiesByName).map(
    ({ universalIdentifier }) => universalIdentifier,
  );

const TARGET_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.calendarEventTarget.universalIdentifier,
  STANDARD_OBJECTS.messageThreadTarget.universalIdentifier,
];

const TARGET_FIELD_UNIVERSAL_IDENTIFIERS = [
  ...getUniversalIdentifiers(STANDARD_OBJECTS.calendarEventTarget.fields),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageThreadTarget.fields),
  STANDARD_OBJECTS.calendarEvent.fields.calendarEventTargets
    .universalIdentifier,
  STANDARD_OBJECTS.messageThread.fields.messageThreadTargets
    .universalIdentifier,
  ...(['person', 'company', 'opportunity'] as const).flatMap((objectName) => [
    STANDARD_OBJECTS[objectName].fields.calendarEventTargets
      .universalIdentifier,
    STANDARD_OBJECTS[objectName].fields.messageThreadTargets
      .universalIdentifier,
  ]),
];

const TARGET_INDEX_UNIVERSAL_IDENTIFIERS = [
  ...getUniversalIdentifiers(STANDARD_OBJECTS.calendarEventTarget.indexes),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageThreadTarget.indexes),
];

@RegisteredWorkspaceCommand('2.37.0', 1787832412051)
@Command({
  name: 'upgrade:2-37:sync-message-calendar-target-metadata',
  description:
    'Create messageThreadTarget and calendarEventTarget standard metadata in existing workspaces',
})
export class SyncMessageCalendarTargetMetadataCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);
    const requiredObjectNames = [
      'calendarEvent',
      'messageThread',
      'person',
      'company',
      'opportunity',
    ] as const;
    const missingObjectNames = requiredObjectNames.filter(
      (objectName) =>
        !flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS[objectName].universalIdentifier
        ],
    );

    if (missingObjectNames.length > 0) {
      this.logger.warn(
        `Skipping message and calendar target metadata for workspace ${workspaceId}: missing ${missingObjectNames.join(', ')} metadata`,
      );

      return;
    }
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
    const objectRenameUpdates = buildTargetObjectCollisionRenameUpdates({
      flatObjectMetadataMaps,
      now,
    });
    const fieldRenameUpdates = buildTargetFieldCollisionRenameUpdates({
      flatFieldMetadataMaps,
      now,
    });
    const allFlatEntityOperationByMetadataName = {
      objectMetadata: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatObjectMetadata>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatObjectMetadataMaps,
            existingFlatEntityMaps: flatObjectMetadataMaps,
            universalIdentifiers: TARGET_OBJECT_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      fieldMetadata: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatFieldMetadataMaps,
            existingFlatEntityMaps: flatFieldMetadataMaps,
            universalIdentifiers: TARGET_FIELD_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      index: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
            standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
            existingFlatEntityMaps: flatIndexMaps,
            universalIdentifiers: TARGET_INDEX_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
    };
    const createOperationCount = Object.values(
      allFlatEntityOperationByMetadataName,
    ).reduce(
      (count, operations) => count + operations.flatEntityToCreate.length,
      0,
    );
    const totalOperationCount =
      objectRenameUpdates.length +
      fieldRenameUpdates.length +
      createOperationCount;

    if (totalOperationCount === 0) {
      this.logger.log(
        `Message and calendar target metadata already exists for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would rename ${objectRenameUpdates.length} object and ${fieldRenameUpdates.length} field collision(s), then create ${createOperationCount} target metadata entities for workspace ${workspaceId}`,
      );

      return;
    }

    for (const flatObjectMetadata of objectRenameUpdates) {
      await this.runRenameMigration({
        workspaceId,
        applicationUniversalIdentifier:
          flatObjectMetadata.applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          objectMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: [flatObjectMetadata],
          },
        },
      });
    }

    for (const flatFieldMetadata of fieldRenameUpdates) {
      await this.runRenameMigration({
        workspaceId,
        applicationUniversalIdentifier:
          flatFieldMetadata.applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: [flatFieldMetadata],
          },
        },
      });
    }

    if (createOperationCount > 0) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            allFlatEntityOperationByMetadataName,
            workspaceId,
            isSystemBuild: true,
            applicationUniversalIdentifier:
              twentyStandardFlatApplication.universalIdentifier,
          },
        );

      if (result.status === 'fail') {
        throw new Error(
          `Failed to create message and calendar target metadata for workspace ${workspaceId}: ${JSON.stringify(result, null, 2)}`,
        );
      }
    }

    this.logger.log(
      `Created message and calendar target metadata for workspace ${workspaceId}`,
    );
  }

  private async runRenameMigration({
    workspaceId,
    applicationUniversalIdentifier,
    allFlatEntityOperationByMetadataName,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    allFlatEntityOperationByMetadataName: Parameters<
      WorkspaceMigrationValidateBuildAndRunService['validateBuildAndRunLegacyWorkspaceMigration']
    >[0]['allFlatEntityOperationByMetadataName'];
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName,
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier,
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to rename target metadata collision for workspace ${workspaceId}: ${JSON.stringify(result, null, 2)}`,
      );
    }
  }
}
