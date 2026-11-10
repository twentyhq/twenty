import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path.type';
import { getRelatedRecordPathFieldMetadataUniversalIdentifiers } from 'src/engine/metadata-modules/related-record-path/utils/get-related-record-path-field-metadata-universal-identifiers.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const getHopsKey = (
  hops: Parameters<
    typeof getRelatedRecordPathFieldMetadataUniversalIdentifiers
  >[0],
) => getRelatedRecordPathFieldMetadataUniversalIdentifiers(hops).join(':');

@RegisteredWorkspaceCommand('2.58.0', 1794354007923)
@Command({
  name: 'upgrade:2-58:align-standard-related-record-paths-inherent-flag',
  description:
    'Align the inherent flag of the standard related record paths, now that notes and tasks follow their targets inherently',
})
export class AlignStandardRelatedRecordPathsInherentFlagCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  private isInherentByStandardHopsKey: Map<string, boolean> | undefined;

  private getIsInherentByStandardHopsKey(): Map<string, boolean> {
    this.isInherentByStandardHopsKey ??= new Map(
      Object.values(
        computeTwentyStandardApplicationAllFlatEntityMaps({
          now: new Date().toISOString(),
          workspaceId: v4(),
          twentyStandardApplicationId: v4(),
        }).allFlatEntityMaps.flatRelatedRecordPathMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .map((standardFlatRelatedRecordPath) => [
          getHopsKey(standardFlatRelatedRecordPath),
          standardFlatRelatedRecordPath.isInherent,
        ]),
    );

    return this.isInherentByStandardHopsKey;
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatRelatedRecordPathMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRelatedRecordPathMaps',
      ]);
    const isInherentByStandardHopsKey = this.getIsInherentByStandardHopsKey();

    const flatRelatedRecordPathsToUpdate: FlatRelatedRecordPath[] =
      Object.values(flatRelatedRecordPathMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(
          (flatRelatedRecordPath) =>
            flatRelatedRecordPath.applicationUniversalIdentifier ===
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        )
        .flatMap((flatRelatedRecordPath) => {
          const isInherent = isInherentByStandardHopsKey.get(
            getHopsKey(flatRelatedRecordPath),
          );

          return isDefined(isInherent) &&
            isInherent !== flatRelatedRecordPath.isInherent
            ? [{ ...flatRelatedRecordPath, isInherent }]
            : [];
        });

    if (flatRelatedRecordPathsToUpdate.length === 0) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: aligning the inherent flag of ${flatRelatedRecordPathsToUpdate.length} standard related record path(s)`,
    );

    if (options.dryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            relatedRecordPath: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: flatRelatedRecordPathsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to align standard related record paths for workspace ${workspaceId}`,
      );
    }
  }
}
