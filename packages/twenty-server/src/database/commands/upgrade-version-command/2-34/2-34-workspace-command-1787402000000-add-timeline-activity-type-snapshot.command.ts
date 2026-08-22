import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { buildTimelineActivityTypeBackfillQuery } from 'src/database/commands/upgrade-version-command/2-33/utils/build-timeline-activity-type-backfill-query.util';
import { buildTimelineActivityTypeSnapshotBackfillQuery } from 'src/database/commands/upgrade-version-command/2-34/utils/build-timeline-activity-type-snapshot-backfill-query.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const TIMELINE_ACTIVITY = STANDARD_OBJECTS.timelineActivity;
const BACKFILL_BATCH_SIZE = 5000;
@RegisteredWorkspaceCommand('2.34.0', 1787402000000)
@Command({
  name: 'upgrade:2-34:add-timeline-activity-type-snapshot',
  description:
    'Repair rolling-upgrade rows and snapshot timeline activity type values',
})
export class AddTimelineActivityTypeSnapshotCommand extends ProvisionedWorkspaceCommandRunner {
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

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would add and backfill timelineActivity.timelineActivityTypeSnapshot for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await this.createSnapshotField({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
    });

    await this.backfillMissingTimelineActivityTypeIds({
      workspaceId,
      dataSource,
    });
    await this.backfillSnapshots({ workspaceId, dataSource });
  }

  private async createSnapshotField({
    workspaceId,
    applicationUniversalIdentifier,
    twentyStandardApplicationId,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    twentyStandardApplicationId: string;
  }): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const snapshotFieldUniversalIdentifier =
      TIMELINE_ACTIVITY.fields.timelineActivityTypeSnapshot
        .universalIdentifier;

    if (
      isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[
          snapshotFieldUniversalIdentifier
        ],
      )
    ) {
      return;
    }

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId,
      });

    const standardSnapshotField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        universalIdentifier: snapshotFieldUniversalIdentifier,
      });

    if (!isDefined(standardSnapshotField)) {
      throw new Error(
        'Standard application is missing timelineActivity.timelineActivityTypeSnapshot',
      );
    }

    const snapshotFieldToCreate = {
      ...standardSnapshotField,
      // Existing rows are populated before the field becomes required.
      isNullable: true,
      viewFieldIds: [],
      viewFieldUniversalIdentifiers: [],
    };

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [snapshotFieldToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to create the timeline activity type snapshot field for workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );
    }
  }

  private async backfillMissingTimelineActivityTypeIds({
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
        `Workspace ${workspaceId} is missing the shared linked timeline activity type`,
      );
    }

    let lastBatchRowCount = 0;

    do {
      const result = await dataSource.query(
        backfillQuery.sql,
        backfillQuery.parameters,
        undefined,
        { shouldBypassPermissionChecks: true },
      );

      lastBatchRowCount = result?.[1] ?? 0;
    } while (lastBatchRowCount === BACKFILL_BATCH_SIZE);
  }

  private async backfillSnapshots({
    workspaceId,
    dataSource,
  }: {
    workspaceId: string;
    dataSource: NonNullable<RunOnWorkspaceArgs['dataSource']>;
  }): Promise<void> {
    const schemaName = getWorkspaceSchemaName(workspaceId);
    let backfilledRowCount = 0;
    let lastBatchRowCount = 0;

    do {
      const result = await dataSource.query(
        buildTimelineActivityTypeSnapshotBackfillQuery({
          schemaName,
          batchSize: BACKFILL_BATCH_SIZE,
        }),
        [],
        undefined,
        { shouldBypassPermissionChecks: true },
      );

      lastBatchRowCount = result?.[1] ?? 0;
      backfilledRowCount += lastBatchRowCount;
    } while (lastBatchRowCount === BACKFILL_BATCH_SIZE);

    this.logger.log(
      `Backfilled ${backfilledRowCount} timeline activity type snapshots for workspace ${workspaceId}`,
    );
  }
}
