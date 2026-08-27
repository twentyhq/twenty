import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { normalizeRecordCrudRichTextFieldsInSteps } from 'src/database/commands/upgrade-version-command/2-36/utils/normalize-record-crud-rich-text-fields.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { findRichTextFieldNames } from 'src/modules/workflow/workflow-executor/utils/find-rich-text-field-names.util';

@RegisteredWorkspaceCommand('2.36.0', 1787827154863)
@Command({
  name: 'upgrade:2-36:normalize-workflow-record-crud-rich-text-fields',
  description:
    'Normalize bare-string rich text field values into the { blocknote, markdown } object shape in workflow create/update/upsert record steps, which otherwise throws at runtime',
})
export class NormalizeWorkflowRecordCrudRichTextFieldsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const workflowVersionObject =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.universalIdentifier,
      });

    if (!isDefined(workflowVersionObject)) {
      return;
    }

    const richTextFieldNamesByObjectName =
      this.buildRichTextFieldNamesByObjectName({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

    if (Object.keys(richTextFieldNamesByObjectName).length === 0) {
      return;
    }

    const workflowVersionRepository =
      await this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const allVersions = await workflowVersionRepository.find();

    let updatedCount = 0;

    for (const version of allVersions) {
      const { value, changed } = normalizeRecordCrudRichTextFieldsInSteps({
        steps: version.steps,
        richTextFieldNamesByObjectName,
      });

      if (!changed) {
        continue;
      }

      updatedCount++;

      if (isDryRun) {
        continue;
      }

      await workflowVersionRepository.update(version.id, {
        steps: value as WorkflowVersionWorkspaceEntity['steps'],
      });
    }

    if (updatedCount > 0) {
      this.logger.log(
        `${isDryRun ? '[DRY RUN] ' : ''}Normalized rich text record fields in ${updatedCount} workflow version(s) for workspace ${workspaceId}`,
      );
    }
  }

  private buildRichTextFieldNamesByObjectName({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): Record<string, string[]> {
    const richTextFieldNamesByObjectName: Record<string, string[]> = {};

    for (const flatObjectMetadata of Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatObjectMetadata)) {
        continue;
      }

      const richTextFieldNames = findRichTextFieldNames({
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      if (richTextFieldNames.length > 0) {
        richTextFieldNamesByObjectName[flatObjectMetadata.nameSingular] =
          richTextFieldNames;
      }
    }

    return richTextFieldNamesByObjectName;
  }
}
