import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path.type';
import { getRelatedRecordPathFieldMetadataUniversalIdentifiers } from 'src/engine/metadata-modules/related-record-path/utils/get-related-record-path-field-metadata-universal-identifiers.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const getHopsKey = (
  hops: Parameters<
    typeof getRelatedRecordPathFieldMetadataUniversalIdentifiers
  >[0],
) => getRelatedRecordPathFieldMetadataUniversalIdentifiers(hops).join(':');

@RegisteredWorkspaceCommand('2.55.0', 1793375369182)
@Command({
  name: 'upgrade:2-55:add-standard-related-record-paths',
  description:
    'Add the standard related record paths and align the inherent flag of matching ones',
})
export class AddStandardRelatedRecordPathsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  private standardFlatRelatedRecordPaths: FlatRelatedRecordPath[] | undefined;

  // The standard paths do not depend on the workspace, so they are built once per run.
  private getStandardFlatRelatedRecordPaths(): FlatRelatedRecordPath[] {
    this.standardFlatRelatedRecordPaths ??= Object.values(
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId: v4(),
        twentyStandardApplicationId: v4(),
      }).allFlatEntityMaps.flatRelatedRecordPathMaps.byUniversalIdentifier,
    ).filter(isDefined);

    return this.standardFlatRelatedRecordPaths;
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps, flatRelatedRecordPathMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatRelatedRecordPathMaps',
      ]);
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const existingFlatRelatedRecordPathByHopsKey = new Map(
      Object.values(flatRelatedRecordPathMaps.byUniversalIdentifier)
        .filter(isDefined)
        .map((flatRelatedRecordPath) => [
          getHopsKey(flatRelatedRecordPath),
          flatRelatedRecordPath,
        ]),
    );

    const flatRelatedRecordPathsToCreate: FlatRelatedRecordPath[] = [];
    const flatRelatedRecordPathsToUpdate: FlatRelatedRecordPath[] = [];

    for (const standardFlatRelatedRecordPath of this.getStandardFlatRelatedRecordPaths()) {
      const existingFlatRelatedRecordPath =
        existingFlatRelatedRecordPathByHopsKey.get(
          getHopsKey(standardFlatRelatedRecordPath),
        );

      if (isDefined(existingFlatRelatedRecordPath)) {
        if (
          existingFlatRelatedRecordPath.applicationUniversalIdentifier ===
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER &&
          existingFlatRelatedRecordPath.isInherent !==
            standardFlatRelatedRecordPath.isInherent
        ) {
          flatRelatedRecordPathsToUpdate.push({
            ...existingFlatRelatedRecordPath,
            isInherent: standardFlatRelatedRecordPath.isInherent,
          });
        }

        continue;
      }

      // Older workspaces may lack some standard objects or have deactivated their relations.
      const hasEveryActiveField =
        getRelatedRecordPathFieldMetadataUniversalIdentifiers(
          standardFlatRelatedRecordPath,
        ).every((fieldMetadataUniversalIdentifier) => {
          const flatFieldMetadata =
            flatFieldMetadataMaps.byUniversalIdentifier[
              fieldMetadataUniversalIdentifier
            ];

          return isDefined(flatFieldMetadata) && flatFieldMetadata.isActive;
        });

      if (hasEveryActiveField) {
        flatRelatedRecordPathsToCreate.push({
          ...standardFlatRelatedRecordPath,
          id: v4(),
          workspaceId,
          applicationId: twentyStandardFlatApplication.id,
        });
      }
    }

    if (
      flatRelatedRecordPathsToCreate.length === 0 &&
      flatRelatedRecordPathsToUpdate.length === 0
    ) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: creating ${flatRelatedRecordPathsToCreate.length} and updating ${flatRelatedRecordPathsToUpdate.length} standard related record path(s)`,
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
              flatEntityToCreate: flatRelatedRecordPathsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: flatRelatedRecordPathsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to add standard related record paths for workspace ${workspaceId}`,
      );
    }
  }
}
