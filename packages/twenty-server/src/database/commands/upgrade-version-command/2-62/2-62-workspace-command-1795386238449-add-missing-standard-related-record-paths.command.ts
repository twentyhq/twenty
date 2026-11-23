import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { MISSING_STANDARD_RELATED_RECORD_PATH_UNIVERSAL_IDENTIFIERS } from 'src/database/commands/upgrade-version-command/2-62/constants/missing-standard-related-record-path-universal-identifiers.constant';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
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

@RegisteredWorkspaceCommand('2.62.0', 1795386238449)
@Command({
  name: 'upgrade:2-62:add-missing-standard-related-record-paths',
  description:
    'Add the message and calendar event standard related record paths a workspace is missing',
})
export class AddMissingStandardRelatedRecordPathsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  private standardFlatRelatedRecordPaths: FlatRelatedRecordPath[] | undefined;

  private getStandardFlatRelatedRecordPaths(): FlatRelatedRecordPath[] {
    if (isDefined(this.standardFlatRelatedRecordPaths)) {
      return this.standardFlatRelatedRecordPaths;
    }

    const standardFlatRelatedRecordPathByUniversalIdentifier =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId: v4(),
        twentyStandardApplicationId: v4(),
      }).allFlatEntityMaps.flatRelatedRecordPathMaps.byUniversalIdentifier;

    this.standardFlatRelatedRecordPaths = Object.values(
      MISSING_STANDARD_RELATED_RECORD_PATH_UNIVERSAL_IDENTIFIERS,
    )
      .map(
        (universalIdentifier) =>
          standardFlatRelatedRecordPathByUniversalIdentifier[
            universalIdentifier
          ],
      )
      .filter(isDefined);

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

    const existingHopsKeys = new Set(
      Object.values(flatRelatedRecordPathMaps.byUniversalIdentifier)
        .filter(isDefined)
        .map(getHopsKey),
    );

    const missingStandardFlatRelatedRecordPaths =
      this.getStandardFlatRelatedRecordPaths().filter(
        (standardFlatRelatedRecordPath) =>
          !existingHopsKeys.has(getHopsKey(standardFlatRelatedRecordPath)) &&
          getRelatedRecordPathFieldMetadataUniversalIdentifiers(
            standardFlatRelatedRecordPath,
          ).every(
            (fieldMetadataUniversalIdentifier) =>
              flatFieldMetadataMaps.byUniversalIdentifier[
                fieldMetadataUniversalIdentifier
              ]?.isActive ?? false,
          ),
      );

    if (missingStandardFlatRelatedRecordPaths.length === 0) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: creating ${missingStandardFlatRelatedRecordPaths.length} standard related record path(s)`,
    );

    if (options.dryRun) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            relatedRecordPath: {
              flatEntityToCreate: missingStandardFlatRelatedRecordPaths.map(
                (standardFlatRelatedRecordPath) => ({
                  ...standardFlatRelatedRecordPath,
                  id: v4(),
                  workspaceId,
                  applicationId: twentyStandardFlatApplication.id,
                }),
              ),
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to add missing standard related record paths for workspace ${workspaceId}`,
      );
    }
  }
}
