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

const buildMissingCoreVersionAliasCondition = (schema: string) => `
  FROM "${schema}"."workflowVersion" "workspaceVersion"
  WHERE "workspaceVersion"."coreWorkflowVersionId" = "coreVersion".id
    AND "workspaceVersion"."deletedAt" IS NULL
    AND "coreVersion"."workspaceId" = $1
    AND "coreVersion"."workspaceWorkflowVersionId" IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM core."workflowVersion" "aliasedVersion"
      WHERE "aliasedVersion"."workspaceId" = $1
        AND "aliasedVersion"."workspaceWorkflowVersionId" = "workspaceVersion".id
    )`;

const RUN_MISSING_CORE_VERSION_CONDITION = `
  FROM core."workflowVersion" "coreVersion"
  WHERE "coreVersion"."workspaceId" = $1
    AND "coreVersion"."workspaceWorkflowVersionId" = "workflowRun"."workflowVersionId"
    AND "workflowRun"."coreWorkflowVersionId" IS NULL`;

@RegisteredWorkspaceCommand('2.60.0', 1794824591819)
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
    const deletedObjectIds = new Set(objectsToDelete.map(({ id }) => id));

    const fieldsToDelete = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (field) =>
          !deletedObjectIds.has(field.objectMetadataId) &&
          (LEGACY_WORKFLOW_VERSION_RELATION_FIELD_UNIVERSAL_IDENTIFIERS.includes(
            field.universalIdentifier,
          ) ||
            (isDefined(field.relationTargetObjectMetadataId) &&
              deletedObjectIds.has(field.relationTargetObjectMetadataId))),
      );
    const deletedFieldIds = new Set(fieldsToDelete.map(({ id }) => id));
    const deletedFieldUniversalIdentifiers = new Set(
      fieldsToDelete.map(({ universalIdentifier }) => universalIdentifier),
    );

    const indexesToDelete = Object.values(flatIndexMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (index) =>
          !deletedObjectIds.has(index.objectMetadataId) &&
          (LEGACY_WORKFLOW_VERSION_ID_INDEX_UNIVERSAL_IDENTIFIERS.includes(
            index.universalIdentifier,
          ) ||
            index.flatIndexFieldMetadatas.some(({ fieldMetadataId }) =>
              deletedFieldIds.has(fieldMetadataId),
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

        return [...deletedFieldIds].some((fieldId) =>
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
    const hasCoreVersionLinks =
      isDefined(workflowVersionObject) &&
      isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[
          LEGACY_WORKFLOW_VERSION_CORE_WORKFLOW_VERSION_ID_FIELD_UNIVERSAL_IDENTIFIER
        ],
      );
    const hasRunLinks = deletedFieldUniversalIdentifiers.has(
      LEGACY_WORKFLOW_RUN_WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
    );
    const hasTimelineActivityLinks = deletedFieldUniversalIdentifiers.has(
      LEGACY_TIMELINE_ACTIVITY_TARGET_WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
    );

    const legacyDataSummary = await this.summarizeLegacyData({
      workspaceId,
      dataSource,
      schema,
      hasWorkflowVersionObject: isDefined(workflowVersionObject),
      hasCoreVersionLinks,
      hasRunLinks,
      hasTimelineActivityLinks,
    });

    const plan = `${objectsToDelete.length} object(s), ${fieldsToDelete.length} field(s), ${indexesToDelete.length} index(es), ${pageLayoutWidgetsToDelete.length} widget(s) holding ${legacyDataSummary}`;

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would drop ${plan} for workspace ${workspaceId}`,
      );

      return;
    }

    const backfilledCoreVersionAliasCount = hasCoreVersionLinks
      ? await this.backfillCoreVersionAliases({
          workspaceId,
          dataSource,
          schema,
        })
      : 0;

    const backfilledRunCount = hasRunLinks
      ? await this.backfillRunCoreVersionIds({
          workspaceId,
          dataSource,
          schema,
        })
      : 0;

    this.logger.log(
      `Backfilled ${backfilledCoreVersionAliasCount} core version alias(es) and ${backfilledRunCount} run core version id(s) for workspace ${workspaceId}`,
    );

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

    this.logger.log(`Dropped ${plan} for workspace ${workspaceId}`);
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
    const [, backfilledCount]: [unknown[], number] = await dataSource.query(
      `UPDATE core."workflowVersion" "coreVersion"
       SET "workspaceWorkflowVersionId" = "workspaceVersion".id
       ${buildMissingCoreVersionAliasCondition(schema)}`,
      [workspaceId],
    );

    if (backfilledCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'workflowAutomatedTriggerMaps',
      ]);
    }

    return backfilledCount;
  }

  private async backfillRunCoreVersionIds({
    workspaceId,
    dataSource,
    schema,
  }: {
    workspaceId: string;
    dataSource: NonNullable<RunOnWorkspaceArgs['dataSource']>;
    schema: string;
  }): Promise<number> {
    const [, backfilledCount]: [unknown[], number] = await dataSource.query(
      `UPDATE "${schema}"."workflowRun" "workflowRun"
       SET "coreWorkflowVersionId" = "coreVersion".id,
           "coreWorkflowId" = COALESCE("workflowRun"."coreWorkflowId", "coreVersion"."coreWorkflowId")
       ${RUN_MISSING_CORE_VERSION_CONDITION}`,
      [workspaceId],
    );

    return backfilledCount;
  }

  private async summarizeLegacyData({
    workspaceId,
    dataSource,
    schema,
    hasWorkflowVersionObject,
    hasCoreVersionLinks,
    hasRunLinks,
    hasTimelineActivityLinks,
  }: {
    workspaceId: string;
    dataSource: NonNullable<RunOnWorkspaceArgs['dataSource']>;
    schema: string;
    hasWorkflowVersionObject: boolean;
    hasCoreVersionLinks: boolean;
    hasRunLinks: boolean;
    hasTimelineActivityLinks: boolean;
  }): Promise<string> {
    if (!hasWorkflowVersionObject) {
      return 'no legacy records';
    }

    const countRows = async ({
      query,
      parameters = [],
    }: {
      query: string;
      parameters?: unknown[];
    }) => {
      const [{ count }]: { count: string }[] = await dataSource.query(
        query,
        parameters,
      );

      return Number(count);
    };

    const workflowVersionRecordCount = await countRows({
      query: `SELECT COUNT(*) AS count FROM "${schema}"."workflowVersion"`,
    });
    const coreVersionAliasBackfillCount = hasCoreVersionLinks
      ? await countRows({
          query: `SELECT COUNT(*) AS count FROM core."workflowVersion" "coreVersion" WHERE EXISTS (SELECT 1 ${buildMissingCoreVersionAliasCondition(schema)})`,
          parameters: [workspaceId],
        })
      : 0;
    const runLinkCount = hasRunLinks
      ? await countRows({
          query: `SELECT COUNT(*) AS count FROM "${schema}"."workflowRun" WHERE "workflowVersionId" IS NOT NULL`,
        })
      : 0;
    const runWithoutCoreVersionCount = hasRunLinks
      ? await countRows({
          query: `SELECT COUNT(*) AS count FROM "${schema}"."workflowRun" WHERE "workflowVersionId" IS NOT NULL AND "coreWorkflowVersionId" IS NULL`,
        })
      : 0;
    const timelineActivityLinkCount = hasTimelineActivityLinks
      ? await countRows({
          query: `SELECT COUNT(*) AS count FROM "${schema}"."timelineActivity" WHERE "targetWorkflowVersionId" IS NOT NULL`,
        })
      : 0;

    return `${workflowVersionRecordCount} workflow version record(s), ${runLinkCount} run link(s) (${runWithoutCoreVersionCount} without a core version id), ${timelineActivityLinkCount} timeline activity link(s); ${coreVersionAliasBackfillCount} core version alias(es) to backfill first`;
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
