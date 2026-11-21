import { Inject } from '@nestjs/common';

import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildAddRichTextFileIdsColumnStatements } from 'src/database/commands/upgrade-version-command/2-61/utils/build-add-rich-text-file-ids-column-statements.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.61.0', 1795265526661)
@Command({
  name: 'upgrade:2-61:add-rich-text-file-ids-columns',
  description:
    'Add the fileIds column to every rich text field, ahead of the release that declares the sub-field',
})
export class AddRichTextFileIdsColumnsCommand extends ProvisionedWorkspaceCommandRunner {
  @Inject(WorkspaceCacheService)
  private readonly workspaceCacheService: WorkspaceCacheService;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
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

    const richTextFields = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).flatMap((flatFieldMetadata) => {
      if (flatFieldMetadata?.type !== FieldMetadataType.RICH_TEXT) {
        return [];
      }

      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatFieldMetadata.objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(flatObjectMetadata)) {
        this.logger.warn(
          `Workspace ${workspaceId}: skipping rich text field ${flatFieldMetadata.id}, its object ${flatFieldMetadata.objectMetadataId} is missing`,
        );

        return [];
      }

      return [
        {
          tableName: computeObjectTargetTable(flatObjectMetadata),
          fieldName: flatFieldMetadata.name,
        },
      ];
    });

    const statements = buildAddRichTextFileIdsColumnStatements({
      schemaName: getWorkspaceSchemaName(workspaceId),
      richTextFields,
    });

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: adding the fileIds column to ${richTextFields.length} rich text field(s)`,
    );

    if (options.dryRun) {
      return;
    }

    for (const statement of statements) {
      await dataSource.query(statement);
    }
  }
}
