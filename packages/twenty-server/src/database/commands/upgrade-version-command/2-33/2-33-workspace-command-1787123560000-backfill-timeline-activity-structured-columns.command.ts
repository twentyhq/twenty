import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { TIMELINE_ACTIVITY_ACTIONS } from 'twenty-shared/timeline';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const TIMELINE_ACTIVITY = STANDARD_OBJECTS.timelineActivity;
const LINKED_NAME_PREFIX = 'linked-';


@RegisteredWorkspaceCommand('2.33.0', 1787123560000)
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

    const result = await dataSource.query(
      this.buildBackfillQuery({
        schemaName: getWorkspaceSchemaName(workspaceId),
        objectCount: objectMetadataIdByNameSingular.length,
      }),
      [TIMELINE_ACTIVITY_ACTIONS, ...objectMetadataIdByNameSingular.flat()],
      undefined,
      { shouldBypassPermissionChecks: true },
    );

    this.logger.log(
      `Backfilled ${result?.[1] ?? 0} timelineActivity rows for workspace ${workspaceId}`,
    );
  }

  // Mirrors getTimelineActivityAction: the legacy name encodes the action, and a
  // linked row's create and delete are really a link and an unlink. Rows whose
  // name carries no known action keep a null action and the read-time fallback.
  private buildBackfillQuery({
    schemaName,
    objectCount,
  }: {
    schemaName: string;
    objectCount: number;
  }): string {
    const namePrefix = `split_part(source."name", '.', 1)`;
    const nameAction = `split_part(source."name", '.', 2)`;
    const sourceNameSingular = `CASE
        WHEN ${namePrefix} LIKE '${LINKED_NAME_PREFIX}%'
        THEN substring(${namePrefix} FROM ${LINKED_NAME_PREFIX.length + 1})
        ELSE ${namePrefix}
      END`;

    const objectValues = Array.from({ length: objectCount }, (_, index) => {
      const nameParameter = `$${index * 2 + 2}`;
      const idParameter = `$${index * 2 + 3}`;

      return index === 0
        ? `(${nameParameter}::text, ${idParameter}::uuid)`
        : `(${nameParameter}, ${idParameter})`;
    }).join(', ');

    return `UPDATE "${schemaName}"."timelineActivity" AS target
      SET "action" = derived."action",
          "sourceObjectMetadataId" = COALESCE(
            target."sourceObjectMetadataId",
            derived."objectMetadataId"
          )
      FROM (
        SELECT
          source."id",
          CASE
            WHEN source."name" LIKE '${LINKED_NAME_PREFIX}%'
              AND ${nameAction} = 'created' THEN 'linked'
            WHEN source."name" LIKE '${LINKED_NAME_PREFIX}%'
              AND ${nameAction} = 'deleted' THEN 'unlinked'
            ELSE ${nameAction}
          END AS "action",
          object."objectMetadataId"
        FROM "${schemaName}"."timelineActivity" AS source
        LEFT JOIN (VALUES ${objectValues})
          AS object("nameSingular", "objectMetadataId")
          ON object."nameSingular" = ${sourceNameSingular}
        WHERE source."action" IS NULL
          AND source."name" IS NOT NULL
          AND ${nameAction} = ANY($1::text[])
      ) AS derived
      WHERE target."id" = derived."id"`;
  }
}
