import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.calendarEventParticipant.fields.applicationId
    .universalIdentifier,
  STANDARD_OBJECTS.calendarEventParticipant.fields.callRecording
    .universalIdentifier,
  STANDARD_OBJECTS.callRecording.fields.calendarEventParticipants
    .universalIdentifier,
];
const INDEX_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.calendarEventParticipant.indexes.callRecordingIdUniqueIndex
    .universalIdentifier,
];

@RegisteredWorkspaceCommand('2.49.0', 1792153361513)
@Command({
  name: 'upgrade:2-49:add-recording-calendar-participants',
  description:
    'Add application calendar participants and backfill scheduled recording bots',
})
export class AddRecordingCalendarParticipantsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    await this.syncMetadata({
      workspaceId,
      isDryRun: options.dryRun ?? false,
      direction: 'up',
    });

    if (options.dryRun) {
      return;
    }

    const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

    await this.dataSource.query(
      `INSERT INTO ${schema}."calendarEventParticipant"
        ("callRecordingId", "calendarEventId", "applicationId", "handle", "displayName", "isOrganizer", "responseStatus")
       SELECT recording.id, recording."calendarEventId", recording."applicationId", application.name, application.name, false,
         (CASE WHEN recording.status = 'FAILED' THEN 'DECLINED' ELSE 'ACCEPTED' END)::${schema}."calendarEventParticipant_responseStatus_enum"
       FROM ${schema}."callRecording" recording
       JOIN core.application application ON application.id = recording."applicationId" AND application."workspaceId" = $1
       JOIN ${schema}."calendarEvent" event ON event.id = recording."calendarEventId" AND event."deletedAt" IS NULL
       WHERE recording."deletedAt" IS NULL
         AND NULLIF(BTRIM(recording."externalBotId"), '') IS NOT NULL
         AND recording."recordingRequestStatus" IS DISTINCT FROM 'CANCELED'
         AND recording.status <> 'NOT_RECORDED'
       ON CONFLICT ("callRecordingId") DO NOTHING`,
      [workspaceId],
    );
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    if (
      !isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.calendarEventParticipant.fields.callRecording
            .universalIdentifier
        ],
      )
    ) {
      return;
    }

    if (!options.dryRun) {
      const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

      await this.dataSource.query(
        `DELETE FROM ${schema}."calendarEventParticipant" WHERE "callRecordingId" IS NOT NULL`,
      );
    }

    await this.syncMetadata({
      workspaceId,
      isDryRun: options.dryRun ?? false,
      direction: 'down',
    });
  }

  private async syncMetadata({
    workspaceId,
    isDryRun,
    direction,
  }: {
    workspaceId: string;
    isDryRun: boolean;
    direction: 'up' | 'down';
  }): Promise<void> {
    const { flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const { allFlatEntityMaps: standardMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });
    const allFlatEntityOperationByMetadataName = {
      fieldMetadata: {
        flatEntityToCreate:
          direction === 'up'
            ? getStandardFlatEntitiesToCreateOrThrow({
                standardFlatEntityMaps: standardMaps.flatFieldMetadataMaps,
                existingFlatEntityMaps: flatFieldMetadataMaps,
                universalIdentifiers: FIELD_UNIVERSAL_IDENTIFIERS,
              })
            : [],
        flatEntityToDelete:
          direction === 'down'
            ? FIELD_UNIVERSAL_IDENTIFIERS.map(
                (id) => flatFieldMetadataMaps.byUniversalIdentifier[id],
              ).filter(isDefined)
            : [],
        flatEntityToUpdate: [],
      },
      index: {
        flatEntityToCreate:
          direction === 'up'
            ? getStandardFlatEntitiesToCreateOrThrow({
                standardFlatEntityMaps: standardMaps.flatIndexMaps,
                existingFlatEntityMaps: flatIndexMaps,
                universalIdentifiers: INDEX_UNIVERSAL_IDENTIFIERS,
              })
            : [],
        flatEntityToDelete:
          direction === 'down'
            ? INDEX_UNIVERSAL_IDENTIFIERS.map(
                (id) => flatIndexMaps.byUniversalIdentifier[id],
              ).filter(isDefined)
            : [],
        flatEntityToUpdate: [],
      },
    };

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would ${direction === 'up' ? 'add and backfill' : 'remove'} recording calendar participants for workspace ${workspaceId}`,
      );
      return;
    }

    if (
      Object.values(allFlatEntityOperationByMetadataName).every(
        ({ flatEntityToCreate, flatEntityToDelete }) =>
          flatEntityToCreate.length + flatEntityToDelete.length === 0,
      )
    ) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName,
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to ${direction} recording calendar participants for workspace ${workspaceId}`,
      );
    }
  }
}
