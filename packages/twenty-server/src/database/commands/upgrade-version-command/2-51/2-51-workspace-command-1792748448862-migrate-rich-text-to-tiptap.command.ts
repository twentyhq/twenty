import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { EXPORT_NOTE_TO_PDF_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-51/constants/export-note-to-pdf-command-menu-item-universal-identifier.constant';
import { RICH_TEXT_RECORD_CONVERSION_BATCH_SIZE } from 'src/database/commands/upgrade-version-command/2-51/constants/rich-text-record-conversion-batch-size.constant';
import { convertStandaloneRichTextWidgetBodyToTiptap } from 'src/database/commands/upgrade-version-command/2-51/utils/convert-standalone-rich-text-widget-body-to-tiptap.util';
import { convertWorkflowRichTextStepsToTiptap } from 'src/database/commands/upgrade-version-command/2-51/utils/convert-workflow-rich-text-steps-to-tiptap.util';
import { fillLegacyBlockNoteMentionObjectNames } from 'src/database/commands/upgrade-version-command/2-51/utils/fill-legacy-blocknote-mention-object-names.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { transformRichTextValue } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type RichTextRecordRow = {
  id: string;
  blocknote: string | null;
  markdown: string | null;
};

const NIL_UUID = '00000000-0000-0000-0000-000000000000';

@RegisteredWorkspaceCommand('2.51.0', 1792748448862)
@Command({
  name: 'upgrade:2-51:migrate-rich-text-to-tiptap',
  description:
    'Store rich text values, workflow record step rich text values and standalone rich text widget bodies as TipTap documents, keeping the BlockNote blocks untouched, and remove the BlockNote-only Export to PDF command menu item',
})
export class MigrateRichTextToTiptapCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would migrate rich text to TipTap in workspace ${workspaceId}`,
      );

      return;
    }

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const objectNameSingularByObjectMetadataId = new Map(
      Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .map((flatObjectMetadata) => [
          flatObjectMetadata.id,
          flatObjectMetadata.nameSingular,
        ]),
    );

    let convertedRecordCount = 0;

    for (const flatFieldMetadata of Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(flatFieldMetadata) ||
        !isFlatFieldMetadataOfType(
          flatFieldMetadata,
          FieldMetadataType.RICH_TEXT,
        )
      ) {
        continue;
      }

      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatFieldMetadata.objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(flatObjectMetadata)) {
        continue;
      }

      convertedRecordCount += await this.convertFieldRecords({
        dataSource,
        tableName: `"${getWorkspaceSchemaName(workspaceId)}"."${computeObjectTargetTable(flatObjectMetadata)}"`,
        fieldName: flatFieldMetadata.name,
        objectNameSingularByObjectMetadataId,
      });
    }

    const convertedWorkflowVersionCount = await this.convertWorkflowVersions(
      dataSource,
      workspaceId,
    );
    const convertedWidgetCount = await this.convertStandaloneRichTextWidgets({
      dataSource,
      workspaceId,
      objectNameSingularByObjectMetadataId,
    });

    if (convertedWorkflowVersionCount + convertedWidgetCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatWorkflowVersionMaps',
        'flatPageLayoutWidgetMaps',
      ]);
    }

    await this.removeExportNoteToPdfCommandMenuItem(workspaceId);

    this.logger.log(
      `Migrated rich text to TipTap in workspace ${workspaceId}: ${convertedRecordCount} record value(s), ${convertedWorkflowVersionCount} workflow version(s), ${convertedWidgetCount} widget(s)`,
    );
  }

  async down(): Promise<void> {}

  private async removeExportNoteToPdfCommandMenuItem(
    workspaceId: string,
  ): Promise<void> {
    const { flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const exportNoteToPdfCommandMenuItem =
      findFlatEntityByUniversalIdentifier<FlatCommandMenuItem>({
        flatEntityMaps: flatCommandMenuItemMaps,
        universalIdentifier:
          EXPORT_NOTE_TO_PDF_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(exportNoteToPdfCommandMenuItem)) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [exportNoteToPdfCommandMenuItem],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to remove the Export to PDF command menu item for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }
  }

  private async convertFieldRecords({
    dataSource,
    tableName,
    fieldName,
    objectNameSingularByObjectMetadataId,
  }: {
    dataSource: DataSource;
    tableName: string;
    fieldName: string;
    objectNameSingularByObjectMetadataId: Map<string, string>;
  }): Promise<number> {
    const blocknoteColumnName = `"${fieldName}Blocknote"`;
    const markdownColumnName = `"${fieldName}Markdown"`;
    const tiptapColumnName = `"${fieldName}Tiptap"`;

    await dataSource.query(
      `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${tiptapColumnName} text`,
    );

    let convertedCount = 0;
    let afterRecordId = NIL_UUID;

    while (true) {
      const rows: RichTextRecordRow[] = await dataSource.query(
        `SELECT id, ${blocknoteColumnName} AS blocknote, ${markdownColumnName} AS markdown
         FROM ${tableName}
         WHERE ${tiptapColumnName} IS NULL
           AND (${blocknoteColumnName} IS NOT NULL OR ${markdownColumnName} IS NOT NULL)
           AND id > $1
         ORDER BY id LIMIT ${RICH_TEXT_RECORD_CONVERSION_BATCH_SIZE}`,
        [afterRecordId],
      );

      const convertedRows = rows.flatMap(({ id, blocknote, markdown }) => {
        const { tiptap } = transformRichTextValue({
          markdown,
          blocknote: isNonEmptyString(blocknote)
            ? fillLegacyBlockNoteMentionObjectNames({
                serializedBlockNote: blocknote,
                objectNameSingularByObjectMetadataId,
              })
            : blocknote,
        });

        return isDefined(tiptap) ? [{ id, tiptap }] : [];
      });

      if (convertedRows.length > 0) {
        await dataSource.query(
          `UPDATE ${tableName} AS record
           SET ${tiptapColumnName} = converted.tiptap
           FROM unnest($1::uuid[], $2::text[]) AS converted(id, tiptap)
           WHERE record.id = converted.id AND record.${tiptapColumnName} IS NULL`,
          [
            convertedRows.map(({ id }) => id),
            convertedRows.map(({ tiptap }) => tiptap),
          ],
        );
      }

      convertedCount += convertedRows.length;

      if (rows.length < RICH_TEXT_RECORD_CONVERSION_BATCH_SIZE) {
        return convertedCount;
      }

      afterRecordId = rows[rows.length - 1].id;
    }
  }

  private async convertWorkflowVersions(
    dataSource: DataSource,
    workspaceId: string,
  ): Promise<number> {
    const workspaceVersionTable = `"${getWorkspaceSchemaName(workspaceId)}"."workflowVersion"`;
    const [{ hasWorkspaceVersionTable }] = await dataSource.query(
      `SELECT to_regclass($1) IS NOT NULL AS "hasWorkspaceVersionTable"`,
      [workspaceVersionTable],
    );

    const versionsByTable: [string, { id: string; steps: unknown }[]][] = [
      [
        'core."workflowVersion"',
        await dataSource.query(
          `SELECT id, steps FROM core."workflowVersion" WHERE "workspaceId" = $1`,
          [workspaceId],
        ),
      ],
      [
        workspaceVersionTable,
        hasWorkspaceVersionTable
          ? await dataSource.query(
              `SELECT id, steps FROM ${workspaceVersionTable}`,
            )
          : [],
      ],
    ];

    let convertedCount = 0;

    for (const [tableName, versions] of versionsByTable) {
      for (const { id, steps } of versions) {
        const { value, hasChanged } = convertWorkflowRichTextStepsToTiptap(
          steps as WorkflowAction[] | null,
        );

        if (!hasChanged) {
          continue;
        }

        await dataSource.query(
          `UPDATE ${tableName} SET steps = $1::jsonb WHERE id = $2`,
          [JSON.stringify(value), id],
        );

        convertedCount++;
      }
    }

    return convertedCount;
  }

  private async convertStandaloneRichTextWidgets({
    dataSource,
    workspaceId,
    objectNameSingularByObjectMetadataId,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    objectNameSingularByObjectMetadataId: Map<string, string>;
  }): Promise<number> {
    const widgets: { id: string; configuration: unknown }[] =
      await dataSource.query(
        `SELECT id, configuration FROM core."pageLayoutWidget"
         WHERE "workspaceId" = $1 AND configuration ->> 'configurationType' = 'STANDALONE_RICH_TEXT'`,
        [workspaceId],
      );

    let convertedCount = 0;

    for (const { id, configuration } of widgets) {
      const { value, hasChanged } = convertStandaloneRichTextWidgetBodyToTiptap(
        { configuration, objectNameSingularByObjectMetadataId },
      );

      if (!hasChanged) {
        continue;
      }

      await dataSource.query(
        `UPDATE core."pageLayoutWidget" SET configuration = $1::jsonb WHERE id = $2`,
        [JSON.stringify(value), id],
      );

      convertedCount++;
    }

    return convertedCount;
  }
}
