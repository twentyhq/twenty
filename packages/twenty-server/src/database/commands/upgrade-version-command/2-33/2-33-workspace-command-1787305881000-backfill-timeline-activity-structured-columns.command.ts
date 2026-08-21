import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildTimelineActivityBackfillQuery } from 'src/database/commands/upgrade-version-command/2-33/utils/build-timeline-activity-backfill-query.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { buildTimelineActivityRelatedMorphFieldMetadataName } from 'src/modules/timeline/utils/timeline-activity-related-morph-field-metadata-name-builder.util';

const TIMELINE_ACTIVITY = STANDARD_OBJECTS.timelineActivity;


@RegisteredWorkspaceCommand('2.33.0', 1787305881000)
@Command({
  name: 'upgrade:2-33:backfill-timeline-activity-structured-columns',
  description:
    'Backfill timelineActivity.action and timelineActivity.sourceObjectMetadataId from the legacy name on rows written before the columns existed',
})
export class BackfillTimelineActivityStructuredColumnsCommand extends ProvisionedWorkspaceCommandRunner {
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
    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const hasStructuredColumns = [
      TIMELINE_ACTIVITY.fields.action.universalIdentifier,
      TIMELINE_ACTIVITY.fields.sourceObjectMetadataId.universalIdentifier,
    ].every((universalIdentifier) =>
      isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
      ),
    );

    if (!hasStructuredColumns) {
      this.logger.log(
        `timelineActivity structured columns are missing for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const objectMetadataIdByNameSingular = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .map((flatObjectMetadata): [string, string] => [
        flatObjectMetadata.nameSingular,
        flatObjectMetadata.id,
      ]);

    if (!isNonEmptyArray(objectMetadataIdByNameSingular)) {
      this.logger.log(
        `No object metadata for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would backfill timelineActivity structured columns for workspace ${workspaceId}`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    const { query, parameters } = buildTimelineActivityBackfillQuery({
      schemaName,
      objectMetadataIdByNameSingular,
      targetColumnByObjectMetadataId: await this.findTargetColumns({
        dataSource,
        schemaName,
        objectMetadataIdByNameSingular,
      }),
    });

    const result = await dataSource.query(query, parameters, undefined, {
      shouldBypassPermissionChecks: true,
    });

    this.logger.log(
      `Backfilled ${result?.[1] ?? 0} timelineActivity rows for workspace ${workspaceId}`,
    );
  }

  // The morph target columns are read from the schema rather than derived from
  // the current object names, so an object renamed after its rows were written
  // still resolves.
  private async findTargetColumns({
    dataSource,
    schemaName,
    objectMetadataIdByNameSingular,
  }: {
    dataSource: NonNullable<RunOnWorkspaceArgs['dataSource']>;
    schemaName: string;
    objectMetadataIdByNameSingular: [string, string][];
  }): Promise<[string, string][]> {
    const existingColumns = await dataSource.query(
      `SELECT "column_name" FROM information_schema.columns
        WHERE "table_schema" = $1 AND "table_name" = $2`,
      [schemaName, 'timelineActivity'],
      undefined,
      { shouldBypassPermissionChecks: true },
    );

    const existingColumnNames = new Set(
      (existingColumns ?? []).map(
        ({ column_name }: { column_name: string }) => column_name,
      ),
    );

    return objectMetadataIdByNameSingular
      .map(([nameSingular, objectMetadataId]): [string, string] => [
        `${buildTimelineActivityRelatedMorphFieldMetadataName(nameSingular)}Id`,
        objectMetadataId,
      ])
      .filter(([columnName]) => existingColumnNames.has(columnName));
  }

}
