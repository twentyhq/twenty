import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { normalizeRecordCrudRichTextFieldsInSteps } from 'src/database/commands/upgrade-version-command/2-37/utils/normalize-record-crud-rich-text-fields.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@RegisteredWorkspaceCommand('2.37.0', 1787905762209)
@Command({
  name: 'upgrade:2-37:normalize-workflow-record-crud-rich-text-fields',
  description:
    'Normalize bare-string rich text field values into the { blocknote, markdown } object shape in workflow create/update/upsert record steps, which otherwise throws at runtime',
})
export class NormalizeWorkflowRecordCrudRichTextFieldsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
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

    const versionsToSyncToCore: WorkflowVersionWorkspaceEntity[] = [];
    let rewrittenCount = 0;

    for (const version of allVersions) {
      const { value, hasChanged, isRecordCrudRichTextCandidate } =
        normalizeRecordCrudRichTextFieldsInSteps({
          steps: version.steps,
          richTextFieldNamesByObjectName,
        });

      if (!isRecordCrudRichTextCandidate) {
        continue;
      }

      versionsToSyncToCore.push({ ...version, steps: value });

      if (!hasChanged) {
        continue;
      }

      rewrittenCount += 1;

      if (!isDryRun) {
        await workflowVersionRepository.update(version.id, { steps: value });
      }
    }

    if (versionsToSyncToCore.length === 0) {
      return;
    }

    if (!isDryRun) {
      await this.workflowVersionCoreSyncService.upsertToCore(
        workspaceId,
        versionsToSyncToCore,
      );
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Normalized rich text record fields in ${rewrittenCount} workflow version(s) and synced ${versionsToSyncToCore.length} to core for workspace ${workspaceId}`,
    );
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

      const richTextFieldNames = findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatObjectMetadata.fieldIds,
        flatEntityMaps: flatFieldMetadataMaps,
      })
        .filter((field) => field.type === FieldMetadataType.RICH_TEXT)
        .map((field) => field.name);

      if (richTextFieldNames.length > 0) {
        richTextFieldNamesByObjectName[flatObjectMetadata.nameSingular] =
          richTextFieldNames;
      }
    }

    return richTextFieldNamesByObjectName;
  }
}
