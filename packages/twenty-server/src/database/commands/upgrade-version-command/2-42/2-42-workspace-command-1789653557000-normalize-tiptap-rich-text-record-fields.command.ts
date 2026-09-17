import { Command } from 'nest-commander';
import { richTextCompositeType } from 'twenty-shared/types';
import { isDefined, isTipTapBlocksShape } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildTipTapRichTextColumnTargets } from 'src/database/commands/upgrade-version-command/2-42/utils/build-tiptap-rich-text-column-targets.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { transformRichTextValue } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text.util';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

const RECORD_BATCH_SIZE = 200;

@RegisteredWorkspaceCommand('2.42.0', 1789653557000)
@Command({
  name: 'upgrade:2-42:normalize-tiptap-rich-text-record-fields',
  description:
    'Rewrite rich text record values left in the TipTap shape by workflow record steps into BlockNote blocks',
})
export class NormalizeTipTapRichTextRecordFieldsCommand extends ProvisionedWorkspaceCommandRunner {
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
      throw new Error(
        `Cannot normalize rich text values for workspace ${workspaceId}: no data source`,
      );
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const flatObjectMetadatas = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const columnTargets = buildTipTapRichTextColumnTargets({
      flatObjectMetadatas,
      flatFieldMetadataByUniversalIdentifier:
        flatFieldMetadataMaps.byUniversalIdentifier,
      computeColumnName: (fieldName, subFieldName) => {
        const compositeProperty = richTextCompositeType.properties.find(
          (property) => property.name === subFieldName,
        );

        return isDefined(compositeProperty)
          ? computeCompositeColumnName(fieldName, compositeProperty)
          : fieldName;
      },
    });

    let normalizedRecordCount = 0;

    for (const columnTarget of columnTargets) {
      const flatObjectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[
          columnTarget.objectMetadataUniversalIdentifier
        ];

      if (!isDefined(flatObjectMetadata)) {
        continue;
      }

      const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
        workspaceId,
        objectMetadata: flatObjectMetadata,
      });

      let offset = 0;
      let batch: { id: string; blocknote: string | null }[] = [];

      do {
        batch = await dataSource.query<
          { id: string; blocknote: string | null }[]
        >(
          `SELECT "id", "${columnTarget.blocknoteColumnName}" AS blocknote
           FROM "${schemaName}"."${tableName}"
           WHERE "${columnTarget.blocknoteColumnName}" IS NOT NULL
           ORDER BY "id"
           LIMIT ${RECORD_BATCH_SIZE} OFFSET ${offset}`,
        );

        for (const row of batch) {
          if (
            !isDefined(row.blocknote) ||
            !isTipTapBlocksShape(row.blocknote)
          ) {
            continue;
          }

          const { blocknote, markdown } = await transformRichTextValue({
            blocknote: row.blocknote,
            markdown: null,
          });

          if (!isDefined(blocknote) || blocknote === row.blocknote) {
            continue;
          }

          normalizedRecordCount += 1;

          if (options.dryRun ?? false) {
            continue;
          }

          await dataSource.query(
            `UPDATE "${schemaName}"."${tableName}"
             SET "${columnTarget.blocknoteColumnName}" = $1,
                 "${columnTarget.markdownColumnName}" = COALESCE("${columnTarget.markdownColumnName}", $2)
             WHERE "id" = $3`,
            [blocknote, markdown, row.id],
          );
        }

        offset += RECORD_BATCH_SIZE;
      } while (batch.length === RECORD_BATCH_SIZE);
    }

    if (normalizedRecordCount === 0) {
      this.logger.log(
        `No TipTap shaped rich text value to normalize for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${(options.dryRun ?? false) ? '[DRY RUN] Would normalize' : 'Normalized'} ${normalizedRecordCount} rich text value(s) for workspace ${workspaceId}`,
    );
  }
}
