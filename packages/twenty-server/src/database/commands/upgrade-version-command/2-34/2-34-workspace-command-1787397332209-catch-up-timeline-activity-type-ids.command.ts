import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildTimelineActivityTypeBackfillQuery } from 'src/database/commands/upgrade-version-command/2-33/utils/build-timeline-activity-type-backfill-query.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const TIMELINE_ACTIVITY = STANDARD_OBJECTS.timelineActivity;
const BACKFILL_BATCH_SIZE = 5000;

type TimelineActivityTypeAudit = {
  nullTypeIdCount: number;
  danglingTypeIdCount: number;
};

@RegisteredWorkspaceCommand('2.34.0', 1787397332209)
@Command({
  name: 'upgrade:2-34:catch-up-timeline-activity-type-ids',
  description:
    'Backfill timeline activity type IDs written during the 2.33 rollout and report unresolved references',
})
export class CatchUpTimelineActivityTypeIdsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatTimelineActivityTypeMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatTimelineActivityTypeMaps',
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

    const timelineActivityTypeIdField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier:
          TIMELINE_ACTIVITY.fields.timelineActivityTypeId.universalIdentifier,
      });

    if (!isDefined(timelineActivityTypeIdField)) {
      throw new Error(
        `Workspace ${workspaceId} is missing timelineActivity.timelineActivityTypeId after the 2.33 upgrade`,
      );
    }

    const validTimelineActivityTypeIds = Object.values(
      flatTimelineActivityTypeMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .map((flatTimelineActivityType) => flatTimelineActivityType.id);

    const auditBefore = await this.auditTimelineActivityTypeIds({
      workspaceId,
      dataSource,
      validTimelineActivityTypeIds,
    });

    if (options.dryRun === true) {
      this.logger.log(
        `[DRY RUN] Would backfill ${auditBefore.nullTypeIdCount} timelineActivity row(s); found ${auditBefore.danglingTypeIdCount} dangling type reference(s) for workspace ${workspaceId}`,
      );

      return;
    }

    let backfilledRowCount = 0;

    if (auditBefore.nullTypeIdCount > 0) {
      const backfillQuery = buildTimelineActivityTypeBackfillQuery({
        schemaName: getWorkspaceSchemaName(workspaceId),
        flatTimelineActivityTypeMaps,
        batchSize: BACKFILL_BATCH_SIZE,
      });

      if (!isDefined(backfillQuery)) {
        throw new Error(
          `Workspace ${workspaceId} is missing the fallback timeline activity type required for backfill`,
        );
      }

      let lastBatchRowCount = 0;

      // Each batch commits independently and only selects rows still missing a
      // type, so retrying after interruption resumes without rewriting rows.
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
    }

    const auditAfter = await this.auditTimelineActivityTypeIds({
      workspaceId,
      dataSource,
      validTimelineActivityTypeIds,
    });

    this.logger.log(
      `Backfilled ${backfilledRowCount} timelineActivity row(s) for workspace ${workspaceId}`,
    );

    if (auditAfter.nullTypeIdCount > 0 || auditAfter.danglingTypeIdCount > 0) {
      this.logger.warn(
        `Workspace ${workspaceId} still has ${auditAfter.nullTypeIdCount} timelineActivity row(s) without a type and ${auditAfter.danglingTypeIdCount} dangling type reference(s)`,
      );

      return;
    }

    this.logger.log(
      `All timelineActivity rows have valid type references for workspace ${workspaceId}`,
    );
  }

  private async auditTimelineActivityTypeIds({
    workspaceId,
    dataSource,
    validTimelineActivityTypeIds,
  }: {
    workspaceId: string;
    dataSource: NonNullable<RunOnWorkspaceArgs['dataSource']>;
    validTimelineActivityTypeIds: string[];
  }): Promise<TimelineActivityTypeAudit> {
    const [audit] = await dataSource.query(
      `SELECT
        COUNT(*) FILTER (WHERE "timelineActivityTypeId" IS NULL)::integer AS "nullTypeIdCount",
        COUNT(*) FILTER (
          WHERE "timelineActivityTypeId" IS NOT NULL
            AND NOT ("timelineActivityTypeId" = ANY($1::uuid[]))
        )::integer AS "danglingTypeIdCount"
      FROM "${getWorkspaceSchemaName(workspaceId)}"."timelineActivity"`,
      [validTimelineActivityTypeIds],
      undefined,
      { shouldBypassPermissionChecks: true },
    );

    if (!isDefined(audit)) {
      throw new Error(
        `Could not audit timeline activity type references for workspace ${workspaceId}`,
      );
    }

    return audit;
  }
}
