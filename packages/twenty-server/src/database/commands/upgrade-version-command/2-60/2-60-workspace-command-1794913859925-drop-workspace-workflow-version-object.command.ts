import { Command } from 'nest-commander';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  LEGACY_TIMELINE_ACTIVITY_TARGET_WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKFLOW_RUN_WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKFLOW_VERSION_CORE_WORKFLOW_VERSION_ID_FIELD_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKFLOW_VERSION_ID_INDEX_UNIVERSAL_IDENTIFIERS,
  LEGACY_WORKFLOW_VERSION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/upgrade-version-command/2-60/constants/legacy-workspace-workflow-version-universal-identifiers.constant';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const LEGACY_WORKFLOW_VERSION_RELATION_FIELD_UNIVERSAL_IDENTIFIERS = [
  LEGACY_WORKFLOW_RUN_WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
  LEGACY_TIMELINE_ACTIVITY_TARGET_WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
];

const buildAliasBackfillCte = (schema: string) => `
  WITH "aliasBackfill" AS (
    SELECT DISTINCT ON ("coreVersion".id)
      "coreVersion".id AS "coreVersionId",
      "workspaceVersion".id AS "workspaceVersionId"
    FROM core."workflowVersion" "coreVersion"
    JOIN "${schema}"."workflowVersion" "workspaceVersion"
      ON "workspaceVersion"."coreWorkflowVersionId" = "coreVersion".id
    WHERE "coreVersion"."workspaceId" = $1
      AND "coreVersion"."workspaceWorkflowVersionId" IS NULL
      AND "workspaceVersion"."deletedAt" IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM core."workflowVersion" "aliasedVersion"
        WHERE "aliasedVersion"."workspaceId" = $1
          AND "aliasedVersion"."workspaceWorkflowVersionId" = "workspaceVersion".id
      )
    ORDER BY "coreVersion".id, "workspaceVersion"."createdAt" DESC
  )`;

const buildRunRepairCte = ({
  schema,
  hasWorkspaceCoreVersionIdField,
}: {
  schema: string;
  hasWorkspaceCoreVersionIdField: boolean;
}) => `
  WITH "versionResolution" AS (
    SELECT DISTINCT ON ("workspaceVersionId")
      "workspaceVersionId", "coreVersionId", "coreWorkflowId"
    FROM (
      SELECT
        "coreVersion"."workspaceWorkflowVersionId" AS "workspaceVersionId",
        "coreVersion".id AS "coreVersionId",
        "coreVersion"."coreWorkflowId",
        0 AS "priority"
      FROM core."workflowVersion" "coreVersion"
      WHERE "coreVersion"."workspaceId" = $1
        AND "coreVersion"."workspaceWorkflowVersionId" IS NOT NULL
      ${
        hasWorkspaceCoreVersionIdField
          ? `UNION ALL
      SELECT
        "workspaceVersion".id,
        "coreVersion".id,
        "coreVersion"."coreWorkflowId",
        1
      FROM "${schema}"."workflowVersion" "workspaceVersion"
      JOIN core."workflowVersion" "coreVersion"
        ON "coreVersion".id = "workspaceVersion"."coreWorkflowVersionId"
        AND "coreVersion"."workspaceId" = $1`
          : ''
      }
    ) "candidate"
    ORDER BY "workspaceVersionId", "priority"
  ),
  "runToRepair" AS (
    SELECT
      "workflowRun".id AS "runId",
      "versionResolution"."coreVersionId",
      "versionResolution"."coreWorkflowId"
    FROM "${schema}"."workflowRun" "workflowRun"
    LEFT JOIN "versionResolution"
      ON "versionResolution"."workspaceVersionId" = "workflowRun"."workflowVersionId"
    WHERE "workflowRun"."workflowVersionId" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM core."workflowVersion" "storedVersion"
        WHERE "storedVersion".id = "workflowRun"."coreWorkflowVersionId"
      )
  )`;

type LegacyDataSummary = {
  workflowVersionRecordCount: number;
  runLinkCount: number;
  timelineActivityLinkCount: number;
  aliasBackfillCount: number;
  repairableRunCount: number;
  unresolvableRunCount: number;
};

@RegisteredWorkspaceCommand('2.60.0', 1794913859925)
@Command({
  name: 'upgrade:2-60:drop-workspace-workflow-version-object',
  description:
    'Drop the workspace workflowVersion object now that workflow versions live in core',
})
export class DropWorkspaceWorkflowVersionObjectCommand extends ProvisionedWorkspaceCommandRunner {
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
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.warn(
        `No data source for workspace ${workspaceId}, skipping the workflow version object drop`,
      );

      return;
    }

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    const workflowVersionObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        LEGACY_WORKFLOW_VERSION_OBJECT_UNIVERSAL_IDENTIFIER
      ];
    const objectsToDelete = [workflowVersionObject].filter(isDefined);
    const objectIdsToDelete = new Set(objectsToDelete.map(({ id }) => id));

    const fieldsToDelete = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (field) =>
          !objectIdsToDelete.has(field.objectMetadataId) &&
          (LEGACY_WORKFLOW_VERSION_RELATION_FIELD_UNIVERSAL_IDENTIFIERS.includes(
            field.universalIdentifier,
          ) ||
            (isDefined(field.relationTargetObjectMetadataId) &&
              objectIdsToDelete.has(field.relationTargetObjectMetadataId))),
      );
    const fieldIdsToDelete = new Set(fieldsToDelete.map(({ id }) => id));
    const fieldUniversalIdentifiersToDelete = new Set(
      fieldsToDelete.map(({ universalIdentifier }) => universalIdentifier),
    );

    const indexesToDelete = Object.values(flatIndexMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (index) =>
          !objectIdsToDelete.has(index.objectMetadataId) &&
          (LEGACY_WORKFLOW_VERSION_ID_INDEX_UNIVERSAL_IDENTIFIERS.includes(
            index.universalIdentifier,
          ) ||
            index.flatIndexFieldMetadatas.some(({ fieldMetadataId }) =>
              fieldIdsToDelete.has(fieldMetadataId),
            )),
      );

    const pageLayoutWidgetsToDelete = Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((widget) => {
        if (!isDefined(widget.configuration)) {
          return false;
        }

        const serializedConfiguration = JSON.stringify(widget.configuration);

        return [...fieldIdsToDelete].some((fieldId) =>
          serializedConfiguration.includes(fieldId),
        );
      });

    const hasDeletions =
      objectsToDelete.length +
        fieldsToDelete.length +
        indexesToDelete.length +
        pageLayoutWidgetsToDelete.length >
      0;
    if (!hasDeletions) {
      return;
    }

    const schema = getWorkspaceSchemaName(workspaceId);
    const hasWorkspaceCoreVersionIdField =
      isDefined(workflowVersionObject) &&
      isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[
          LEGACY_WORKFLOW_VERSION_CORE_WORKFLOW_VERSION_ID_FIELD_UNIVERSAL_IDENTIFIER
        ],
      );
    const hasRunLinks = fieldUniversalIdentifiersToDelete.has(
      LEGACY_WORKFLOW_RUN_WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
    );
    const hasTimelineActivityLinks = fieldUniversalIdentifiersToDelete.has(
      LEGACY_TIMELINE_ACTIVITY_TARGET_WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
    );

    const legacyDataSummary = isDefined(workflowVersionObject)
      ? await this.summarizeLegacyData({
          workspaceId,
          dataSource,
          schema,
          hasWorkspaceCoreVersionIdField,
          hasRunLinks,
          hasTimelineActivityLinks,
        })
      : undefined;

    const plan = `${objectsToDelete.length} object(s), ${fieldsToDelete.length} field(s), ${indexesToDelete.length} index(es) and ${pageLayoutWidgetsToDelete.length} widget(s) for workspace ${workspaceId}. Legacy data: ${this.formatLegacyDataSummary(legacyDataSummary)}`;

    if (options.dryRun ?? false) {
      this.logger.log(`[DRY RUN] Would drop ${plan}`);

      return;
    }

    const backfilledAliasCount = hasWorkspaceCoreVersionIdField
      ? await this.backfillCoreVersionAliases({
          workspaceId,
          dataSource,
          schema,
        })
      : 0;

    if (hasRunLinks) {
      await this.repairRunCoreVersions({
        workspaceId,
        dataSource,
        schema,
        hasWorkspaceCoreVersionIdField,
        backfilledAliasCount,
      });
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await this.runMigrationOrThrow({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      allFlatEntityOperationByMetadataName: {
        pageLayoutWidget: {
          flatEntityToCreate: [],
          flatEntityToDelete: pageLayoutWidgetsToDelete,
          flatEntityToUpdate: [],
        },
        index: {
          flatEntityToCreate: [],
          flatEntityToDelete: indexesToDelete,
          flatEntityToUpdate: [],
        },
        fieldMetadata: {
          flatEntityToCreate: [],
          flatEntityToDelete: fieldsToDelete,
          flatEntityToUpdate: [],
        },
        objectMetadata: {
          flatEntityToCreate: [],
          flatEntityToDelete: objectsToDelete,
          flatEntityToUpdate: [],
        },
      },
    });

    this.logger.log(`Dropped ${plan}`);
  }

  private async backfillCoreVersionAliases({
    workspaceId,
    dataSource,
    schema,
  }: {
    workspaceId: string;
    dataSource: NonNullable<RunOnWorkspaceArgs['dataSource']>;
    schema: string;
  }): Promise<number> {
    const [, backfilledAliasCount]: [unknown[], number] =
      await dataSource.query(
        `${buildAliasBackfillCte(schema)}
         UPDATE core."workflowVersion" "coreVersion"
         SET "workspaceWorkflowVersionId" = "aliasBackfill"."workspaceVersionId"
         FROM "aliasBackfill"
         WHERE "coreVersion".id = "aliasBackfill"."coreVersionId"`,
        [workspaceId],
      );

    if (backfilledAliasCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'workflowAutomatedTriggerMaps',
      ]);
    }

    return backfilledAliasCount;
  }

  private async repairRunCoreVersions({
    workspaceId,
    dataSource,
    schema,
    hasWorkspaceCoreVersionIdField,
    backfilledAliasCount,
  }: {
    workspaceId: string;
    dataSource: NonNullable<RunOnWorkspaceArgs['dataSource']>;
    schema: string;
    hasWorkspaceCoreVersionIdField: boolean;
    backfilledAliasCount: number;
  }): Promise<void> {
    const runRepairCte = buildRunRepairCte({
      schema,
      hasWorkspaceCoreVersionIdField,
    });

    const [, repairedRunCount]: [unknown[], number] = await dataSource.query(
      `${runRepairCte}
       UPDATE "${schema}"."workflowRun" "workflowRun"
       SET "coreWorkflowVersionId" = "runToRepair"."coreVersionId",
           "coreWorkflowId" = CASE
             WHEN EXISTS (
               SELECT 1 FROM core."workflow" "storedWorkflow"
               WHERE "storedWorkflow".id = "workflowRun"."coreWorkflowId"
             ) THEN "workflowRun"."coreWorkflowId"
             ELSE "runToRepair"."coreWorkflowId"
           END
       FROM "runToRepair"
       WHERE "workflowRun".id = "runToRepair"."runId"
         AND "runToRepair"."coreVersionId" IS NOT NULL`,
      [workspaceId],
    );

    const unresolvableRunCount = await this.countRows({
      dataSource,
      query: `${runRepairCte} SELECT COUNT(*) AS count FROM "runToRepair"`,
      parameters: [workspaceId],
    });

    this.logger.log(
      `Backfilled ${backfilledAliasCount} core version alias(es) and repaired ${repairedRunCount} run(s) for workspace ${workspaceId}`,
    );

    if (unresolvableRunCount > 0) {
      this.logger.warn(
        `${unresolvableRunCount} run(s) in workspace ${workspaceId} keep no core workflow version: their legacy version link resolves to no core version`,
      );
    }
  }

  private async summarizeLegacyData({
    workspaceId,
    dataSource,
    schema,
    hasWorkspaceCoreVersionIdField,
    hasRunLinks,
    hasTimelineActivityLinks,
  }: {
    workspaceId: string;
    dataSource: NonNullable<RunOnWorkspaceArgs['dataSource']>;
    schema: string;
    hasWorkspaceCoreVersionIdField: boolean;
    hasRunLinks: boolean;
    hasTimelineActivityLinks: boolean;
  }): Promise<LegacyDataSummary> {
    const workflowVersionRecordCount = await this.countRows({
      dataSource,
      query: `SELECT COUNT(*) AS count FROM "${schema}"."workflowVersion"`,
    });
    const aliasBackfillCount = hasWorkspaceCoreVersionIdField
      ? await this.countRows({
          dataSource,
          query: `${buildAliasBackfillCte(schema)} SELECT COUNT(*) AS count FROM "aliasBackfill"`,
          parameters: [workspaceId],
        })
      : 0;
    const timelineActivityLinkCount = hasTimelineActivityLinks
      ? await this.countRows({
          dataSource,
          query: `SELECT COUNT(*) AS count FROM "${schema}"."timelineActivity" WHERE "targetWorkflowVersionId" IS NOT NULL`,
        })
      : 0;

    if (!hasRunLinks) {
      return {
        workflowVersionRecordCount,
        runLinkCount: 0,
        timelineActivityLinkCount,
        aliasBackfillCount,
        repairableRunCount: 0,
        unresolvableRunCount: 0,
      };
    }

    const runLinkCount = await this.countRows({
      dataSource,
      query: `SELECT COUNT(*) AS count FROM "${schema}"."workflowRun" WHERE "workflowVersionId" IS NOT NULL`,
    });
    const runRepairCte = buildRunRepairCte({
      schema,
      hasWorkspaceCoreVersionIdField,
    });
    const repairableRunCount = await this.countRows({
      dataSource,
      query: `${runRepairCte} SELECT COUNT(*) AS count FROM "runToRepair" WHERE "coreVersionId" IS NOT NULL`,
      parameters: [workspaceId],
    });
    const unresolvableRunCount = await this.countRows({
      dataSource,
      query: `${runRepairCte} SELECT COUNT(*) AS count FROM "runToRepair" WHERE "coreVersionId" IS NULL`,
      parameters: [workspaceId],
    });

    return {
      workflowVersionRecordCount,
      runLinkCount,
      timelineActivityLinkCount,
      aliasBackfillCount,
      repairableRunCount,
      unresolvableRunCount,
    };
  }

  private formatLegacyDataSummary(
    summary: LegacyDataSummary | undefined,
  ): string {
    if (!isDefined(summary)) {
      return 'none';
    }

    return `${summary.workflowVersionRecordCount} workflow version record(s), ${summary.runLinkCount} run link(s), ${summary.timelineActivityLinkCount} timeline activity link(s); ${summary.aliasBackfillCount} core version alias(es) to backfill, ${summary.repairableRunCount} run(s) to repair, ${summary.unresolvableRunCount} run(s) that will keep no core workflow version`;
  }

  private async countRows({
    dataSource,
    query,
    parameters = [],
  }: {
    dataSource: NonNullable<RunOnWorkspaceArgs['dataSource']>;
    query: string;
    parameters?: unknown[];
  }): Promise<number> {
    const [{ count }]: { count: string }[] = await dataSource.query(
      query,
      parameters,
    );

    return Number(count);
  }

  private async runMigrationOrThrow(
    args: Omit<
      Parameters<
        WorkspaceMigrationValidateBuildAndRunService['validateBuildAndRunLegacyWorkspaceMigration']
      >[0],
      'isSystemBuild'
    >,
  ): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        { shouldDeferActions: false, ...args, isSystemBuild: true },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        doNotTranslate(
          `Failed to drop the workspace workflow version object for workspace ${args.workspaceId}`,
        ),
      );
    }
  }
}
