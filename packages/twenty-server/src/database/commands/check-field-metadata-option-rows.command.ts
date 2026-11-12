import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';
import { findFieldMetadataOptionRowMismatches } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/find-field-metadata-option-row-mismatches.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Command({
  name: 'workspace:check-field-metadata-option-rows',
  description:
    'Report the select options whose fieldMetadataOption row is missing, unexpected or different from fieldMetadata.options. Read-only.',
})
export class CheckFieldMetadataOptionRowsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps, flatFieldMetadataOptionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatFieldMetadataOptionMaps',
      ]);

    const flatFieldMetadataOptionsByFieldMetadataId = new Map<
      string,
      FlatFieldMetadataOption[]
    >();

    for (const flatFieldMetadataOption of Object.values(
      flatFieldMetadataOptionMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatFieldMetadataOption)) {
        continue;
      }

      flatFieldMetadataOptionsByFieldMetadataId.set(
        flatFieldMetadataOption.fieldMetadataId,
        [
          ...(flatFieldMetadataOptionsByFieldMetadataId.get(
            flatFieldMetadataOption.fieldMetadataId,
          ) ?? []),
          flatFieldMetadataOption,
        ],
      );
    }

    const mismatches = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .flatMap((flatFieldMetadata) =>
        findFieldMetadataOptionRowMismatches({
          flatFieldMetadata,
          flatFieldMetadataOptions:
            flatFieldMetadataOptionsByFieldMetadataId.get(
              flatFieldMetadata.id,
            ) ?? [],
        }),
      );

    for (const mismatch of mismatches) {
      this.logger.warn(
        `Workspace ${workspaceId}: field ${mismatch.fieldMetadataId} option ${mismatch.optionUniversalIdentifier}: ${mismatch.reason}`,
      );
    }

    if (mismatches.length > 0) {
      throw new Error(
        `${mismatches.length} option(s) of workspace ${workspaceId} do not match their rows`,
      );
    }
  }
}
