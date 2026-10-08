import { Command } from 'nest-commander';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { buildTimelineActivityTypeBackfillQuery } from 'src/database/commands/upgrade-version-command/2-33/utils/build-timeline-activity-type-backfill-query.util';
import { hasTimelineActivityObjectMetadata } from 'src/database/commands/upgrade-version-command/2-34/utils/has-timeline-activity-object-metadata.util';
import { buildTimelineActivityTypeSnapshotBackfillQuery } from 'src/database/commands/upgrade-version-command/2-34/utils/build-timeline-activity-type-snapshot-backfill-query.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const LEGACY_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-7207-46e8-9dab-849505ae8497';
const BACKFILL_BATCH_SIZE = 5000;

type TimelineActivityAudit = {
  missingTypeIdCount: number;
  missingSnapshotCount: number;
  danglingTypeIdCount: number;
};

type TimelineActivityAuditRow = {
  missingTypeIdCount: string;
  missingSnapshotCount: string;
  danglingTypeIdCount: string;
};

@RegisteredWorkspaceCommand('2.35.0', 1787648000000)
@Command({
  name: 'upgrade:2-35:contract-timeline-activity-compatibility',
  description:
    'Backfill timeline activity types and remove the legacy name field',
})
export class ContractTimelineActivityCompatibilityCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    if (!hasTimelineActivityObjectMetadata(flatObjectMetadataMaps)) {
      this.logger.log(
        `timelineActivity object does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (!isDefined(dataSource)) {
      throw new Error(
        `Cannot contract timeline activity compatibility without a data source for workspace ${workspaceId}`,
      );
    }

    const legacyNameField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: LEGACY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      });

    const initialAudit = await this.auditTimelineActivities({
      workspaceId,
      dataSource,
    });

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId} timeline activity audit: ${JSON.stringify(initialAudit)}. Would backfill unresolved rows and remove legacy name metadata.`,
      );

      return;
    }

    if (initialAudit.missingTypeIdCount > 0) {
      if (!isDefined(legacyNameField)) {
        throw new Error(
          `Workspace ${workspaceId} has unresolved timeline activity type references but no legacy name field to repair them from: ${JSON.stringify(initialAudit)}`,
        );
      }

      await this.backfillMissingTimelineActivityTypeIds({
        workspaceId,
        dataSource,
      });
    }

    if (initialAudit.missingSnapshotCount > 0) {
      await this.backfillSnapshots({ workspaceId, dataSource });
    }

    const finalAudit = await this.auditTimelineActivities({
      workspaceId,
      dataSource,
    });

    if (
      finalAudit.missingTypeIdCount > 0 ||
      finalAudit.missingSnapshotCount > 0
    ) {
      throw new Error(
        `Refusing to contract timeline activity compatibility for workspace ${workspaceId}; unresolved rows remain after repair: ${JSON.stringify(finalAudit)}`,
      );
    }

    if (!isDefined(legacyNameField)) {
      this.logger.log(
        `Timeline activity compatibility is already contracted for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const migrationResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [legacyNameField],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (migrationResult.status === 'fail') {
      throw new Error(
        `Failed to contract timeline activity compatibility for workspace ${workspaceId}:\n${JSON.stringify(migrationResult, null, 2)}`,
      );
    }

    this.logger.log(
      `Contracted timeline activity compatibility for workspace ${workspaceId}`,
    );
  }

  private async auditTimelineActivities({
    workspaceId,
    dataSource,
  }: {
    workspaceId: string;
    dataSource: NonNullable<RunOnWorkspaceArgs['dataSource']>;
  }): Promise<TimelineActivityAudit> {
    const schemaName = getWorkspaceSchemaName(workspaceId);
    const [audit] = await dataSource.query<TimelineActivityAuditRow[]>(
      `SELECT
  COUNT(*) FILTER (WHERE timeline_activity."timelineActivityTypeId" IS NULL)::text AS "missingTypeIdCount",
  COUNT(*) FILTER (
    WHERE timeline_activity."timelineActivityTypeSnapshot" IS NULL
      AND (
        timeline_activity."timelineActivityTypeId" IS NULL
        OR timeline_activity_type."id" IS NOT NULL
      )
  )::text AS "missingSnapshotCount",
  COUNT(*) FILTER (
    WHERE timeline_activity."timelineActivityTypeId" IS NOT NULL
      AND timeline_activity_type."id" IS NULL
  )::text AS "danglingTypeIdCount"
FROM "${schemaName}"."timelineActivity" timeline_activity
LEFT JOIN "core"."timelineActivityType" timeline_activity_type
  ON timeline_activity_type."id" = timeline_activity."timelineActivityTypeId"
  AND timeline_activity_type."workspaceId" = $1`,
      [workspaceId],
    );

    return {
      missingTypeIdCount: Number(audit.missingTypeIdCount),
      missingSnapshotCount: Number(audit.missingSnapshotCount),
      danglingTypeIdCount: Number(audit.danglingTypeIdCount),
    };
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
    let lastBatchRowCount = 0;
    let afterTimelineActivityId: string | null = null;

    do {
      const backfillQuery = buildTimelineActivityTypeSnapshotBackfillQuery({
        schemaName,
        batchSize: BACKFILL_BATCH_SIZE,
        afterTimelineActivityId,
      });
      const [updatedTimelineActivities, updatedRowCount] =
        await dataSource.query<[Array<{ id: string }>, number]>(
          backfillQuery.sql,
          backfillQuery.parameters,
        );

      lastBatchRowCount = updatedRowCount;

      if (lastBatchRowCount === BACKFILL_BATCH_SIZE) {
        if (!isNonEmptyArray(updatedTimelineActivities)) {
          throw new Error(
            `Snapshot backfill for workspace ${workspaceId} updated rows without returning their identifiers`,
          );
        }

        afterTimelineActivityId = updatedTimelineActivities.reduce(
          (latestId, timelineActivity) =>
            timelineActivity.id > latestId ? timelineActivity.id : latestId,
          updatedTimelineActivities[0].id,
        );
      }
    } while (lastBatchRowCount === BACKFILL_BATCH_SIZE);
  }
}
