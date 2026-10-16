import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CALENDAR_EVENT_SHARING_INDEXES = [
  {
    indexUniversalIdentifier:
      STANDARD_OBJECTS.calendarChannelEventAssociation.indexes
        .eventExternalIdIndex.universalIdentifier,
    objectUniversalIdentifier:
      STANDARD_OBJECTS.calendarChannelEventAssociation.universalIdentifier,
    fieldUniversalIdentifier:
      STANDARD_OBJECTS.calendarChannelEventAssociation.fields.eventExternalId
        .universalIdentifier,
  },
  {
    indexUniversalIdentifier:
      STANDARD_OBJECTS.calendarEvent.indexes.iCalUidIndex.universalIdentifier,
    objectUniversalIdentifier:
      STANDARD_OBJECTS.calendarEvent.universalIdentifier,
    fieldUniversalIdentifier:
      STANDARD_OBJECTS.calendarEvent.fields.iCalUid.universalIdentifier,
  },
];

const CALENDAR_EVENT_SHARING_INDEX_UNIVERSAL_IDENTIFIERS =
  CALENDAR_EVENT_SHARING_INDEXES.map(
    ({ indexUniversalIdentifier }) => indexUniversalIdentifier,
  );

@RegisteredWorkspaceCommand('2.49.0', 1792153151454)
@Command({
  name: 'upgrade:2-49:add-calendar-event-sharing-indexes',
  description:
    'Index calendarChannelEventAssociation.eventExternalId and calendarEvent.iCalUid so calendar import can find another channel copy of an event',
})
export class AddCalendarEventSharingIndexesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const indexUniversalIdentifiersToCreate =
      CALENDAR_EVENT_SHARING_INDEXES.filter(
        ({ objectUniversalIdentifier, fieldUniversalIdentifier }) =>
          isDefined(
            findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
              flatEntityMaps: flatObjectMetadataMaps,
              universalIdentifier: objectUniversalIdentifier,
            }),
          ) &&
          isDefined(
            findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
              flatEntityMaps: flatFieldMetadataMaps,
              universalIdentifier: fieldUniversalIdentifier,
            }),
          ),
      ).map(({ indexUniversalIdentifier }) => indexUniversalIdentifier);

    if (indexUniversalIdentifiersToCreate.length === 0) {
      this.logger.log(
        `Calendar objects not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

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
        universalIdentifiers: indexUniversalIdentifiersToCreate,
      });

    if (indexesToCreate.length === 0) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${indexesToCreate.length} calendar event sharing index(es) for workspace ${workspaceId}`,
      );

      return;
    }

    await this.runIndexMigration({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      flatEntityToCreate: indexesToCreate,
      flatEntityToDelete: [],
    });

    this.logger.log(
      `Created ${indexesToCreate.length} calendar event sharing index(es) for workspace ${workspaceId}`,
    );
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatIndexMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatIndexMaps'],
    );

    const indexesToDelete =
      CALENDAR_EVENT_SHARING_INDEX_UNIVERSAL_IDENTIFIERS.map(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier<FlatIndexMetadata>({
            flatEntityMaps: flatIndexMaps,
            universalIdentifier,
          }),
      ).filter(isDefined);

    if (indexesToDelete.length === 0) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would drop ${indexesToDelete.length} calendar event sharing index(es) for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await this.runIndexMigration({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      flatEntityToCreate: [],
      flatEntityToDelete: indexesToDelete,
    });
  }

  private async runIndexMigration({
    workspaceId,
    applicationUniversalIdentifier,
    flatEntityToCreate,
    flatEntityToDelete,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    flatEntityToCreate: FlatIndexMetadata[];
    flatEntityToDelete: FlatIndexMetadata[];
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            index: {
              flatEntityToCreate,
              flatEntityToDelete,
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
