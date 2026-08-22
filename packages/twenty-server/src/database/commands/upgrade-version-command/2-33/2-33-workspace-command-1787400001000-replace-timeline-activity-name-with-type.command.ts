import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { buildTimelineActivityTypeBackfillQuery } from 'src/database/commands/upgrade-version-command/2-33/utils/build-timeline-activity-type-backfill-query.util';

const TIMELINE_ACTIVITY = STANDARD_OBJECTS.timelineActivity;
const BACKFILL_BATCH_SIZE = 5000;
const LINKED_RECORD_CACHED_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  TIMELINE_ACTIVITY.fields.linkedRecordCachedName.universalIdentifier;

@RegisteredWorkspaceCommand('2.33.0', 1787400001000)
@Command({
  name: 'upgrade:2-33:replace-timeline-activity-name-with-type',
  description:
    'Seed the standard timelineActivityType rows, add timelineActivity.timelineActivityTypeId and backfill it from the deprecated name column',
})
export class ReplaceTimelineActivityNameWithTypeCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const timelineActivityObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: TIMELINE_ACTIVITY.universalIdentifier,
      });

    if (!isDefined(timelineActivityObjectMetadata)) {
      this.logger.log(
        `timelineActivity object does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would add and backfill timelineActivity.timelineActivityTypeId for workspace ${workspaceId}`,
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

    await this.createTypesAndField({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      standardAllFlatEntityMaps,
    });

    await this.backfillTimelineActivityTypeIds({ workspaceId, dataSource });

    await this.repointLabelIdentifierToLinkedRecordCachedName({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
    });

    this.logger.log(
      `Added and backfilled timelineActivity.timelineActivityTypeId for workspace ${workspaceId}`,
    );
  }

  private async createTypesAndField({
    workspaceId,
    applicationUniversalIdentifier,
    standardAllFlatEntityMaps,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    standardAllFlatEntityMaps: ReturnType<
      typeof computeTwentyStandardApplicationAllFlatEntityMaps
    >['allFlatEntityMaps'];
  }): Promise<void> {
    const { flatFieldMetadataMaps, flatTimelineActivityTypeMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatTimelineActivityTypeMaps',
      ]);

    const flatTimelineActivityTypesToCreate = Object.values(
      standardAllFlatEntityMaps.flatTimelineActivityTypeMaps
        .byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatTimelineActivityType: FlatTimelineActivityType) =>
          !isDefined(
            flatTimelineActivityTypeMaps.byUniversalIdentifier[
              flatTimelineActivityType.universalIdentifier
            ],
          ),
      );

    const standardTypeField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        universalIdentifier:
          TIMELINE_ACTIVITY.fields.timelineActivityTypeId.universalIdentifier,
      });

    if (!isDefined(standardTypeField)) {
      throw new Error(
        'Standard application is missing timelineActivity.timelineActivityTypeId',
      );
    }

    const flatFieldMetadatasToCreate = isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        standardTypeField.universalIdentifier
      ],
    )
      ? []
      : [
          {
            ...standardTypeField,
            viewFieldIds: [],
            viewFieldUniversalIdentifiers: [],
          },
        ];

    if (
      flatTimelineActivityTypesToCreate.length === 0 &&
      flatFieldMetadatasToCreate.length === 0
    ) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier,
          allFlatEntityOperationByMetadataName: {
            timelineActivityType: {
              flatEntityToCreate: flatTimelineActivityTypesToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            fieldMetadata: {
              flatEntityToCreate: flatFieldMetadatasToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to create timeline activity types for workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );
    }
  }

  private async backfillTimelineActivityTypeIds({
    workspaceId,
    dataSource,
  }: {
    workspaceId: string;
    dataSource: NonNullable<RunOnWorkspaceArgs['dataSource']>;
  }): Promise<void> {
    const { flatTimelineActivityTypeMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatTimelineActivityTypeMaps',
      ]);

    const backfillQuery = buildTimelineActivityTypeBackfillQuery({
      schemaName: getWorkspaceSchemaName(workspaceId),
      flatTimelineActivityTypeMaps,
      batchSize: BACKFILL_BATCH_SIZE,
    });

    if (!isDefined(backfillQuery)) {
      throw new Error(
        `Workspace ${workspaceId} is missing standard timeline activity types after seeding`,
      );
    }

    let backfilledRowCount = 0;
    let lastBatchRowCount = 0;

    // Each batch commits on its own, so an interrupted run resumes where it
    // stopped: the query only ever picks rows that still have no type.
    do {
      const result = await dataSource.query(
        backfillQuery.sql,
        backfillQuery.parameters,
        undefined,
        { shouldBypassPermissionChecks: true },
      );

      lastBatchRowCount = result?.[1] ?? 0;
      backfilledRowCount += lastBatchRowCount;
    } while (lastBatchRowCount === BACKFILL_BATCH_SIZE);

    this.logger.log(
      `Backfilled ${backfilledRowCount} timelineActivity rows for workspace ${workspaceId}`,
    );
  }

  // Repointing now makes the later removal of `name` independent of this
  // migration while giving the object a useful label during compatibility.
  private async repointLabelIdentifierToLinkedRecordCachedName({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const timelineActivityObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: TIMELINE_ACTIVITY.universalIdentifier,
      });

    if (
      !isDefined(timelineActivityObjectMetadata) ||
      timelineActivityObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier ===
        LINKED_RECORD_CACHED_NAME_FIELD_UNIVERSAL_IDENTIFIER
    ) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier,
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                {
                  ...timelineActivityObjectMetadata,
                  labelIdentifierFieldMetadataUniversalIdentifier:
                    LINKED_RECORD_CACHED_NAME_FIELD_UNIVERSAL_IDENTIFIER,
                },
              ],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to repoint the timelineActivity label identifier for workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );
    }
  }
}
