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
import { buildTimelineActivityRelatedMorphFieldMetadataName } from 'src/modules/timeline/utils/timeline-activity-related-morph-field-metadata-name-builder.util';

const TIMELINE_ACTIVITY = STANDARD_OBJECTS.timelineActivity;
const LINKED_NAME_PREFIX = 'linked-';


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

    const result = await dataSource.query(
      this.buildBackfillQuery({
        schemaName,
        objectCount: objectMetadataIdByNameSingular.length,
        targetColumnByObjectMetadataId: await this.findTargetColumns({
          dataSource,
          schemaName,
          objectMetadataIdByNameSingular,
        }),
      }),
      [TIMELINE_ACTIVITY_ACTIONS, ...objectMetadataIdByNameSingular.flat()],
      undefined,
      { shouldBypassPermissionChecks: true },
    );

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

  // Mirrors getTimelineActivityAction: the legacy name encodes the action, and a
  // linked row's create and delete are really a link and an unlink. Rows whose
  // name carries no known action keep a null action and the read-time fallback.
  private buildBackfillQuery({
    schemaName,
    objectCount,
    targetColumnByObjectMetadataId,
  }: {
    schemaName: string;
    objectCount: number;
    targetColumnByObjectMetadataId: [string, string][];
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

    const selfSourceObjectMetadataId = isNonEmptyArray(
      targetColumnByObjectMetadataId,
    )
      ? `CASE
${targetColumnByObjectMetadataId
  .map(
    ([columnName, objectMetadataId]) =>
      `            WHEN source."${columnName}" IS NOT NULL THEN '${objectMetadataId}'::uuid`,
  )
  .join('\n')}
          END`
      : 'NULL::uuid';

    // Two legacy name formats exist: 'linked-note.created' and 'message.linked'.
    const isLinkRow = `(source."name" LIKE '${LINKED_NAME_PREFIX}%' OR ${nameAction} IN ('linked', 'unlinked'))`;

    // A link row's source is the object it links, a self row's source is its own
    // target. Both are stored on the row and survive a rename, so the name parsed
    // from the legacy format is only the last resort.
    return `UPDATE "${schemaName}"."timelineActivity" AS target
      SET "action" = derived."action",
          "sourceObjectMetadataId" = COALESCE(
            target."sourceObjectMetadataId",
            derived."storedObjectMetadataId",
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
          CASE
            WHEN source."linkedObjectMetadataId" IS NOT NULL
              THEN source."linkedObjectMetadataId"
            WHEN ${isLinkRow} THEN NULL
            ELSE ${selfSourceObjectMetadataId}
          END AS "storedObjectMetadataId",
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
