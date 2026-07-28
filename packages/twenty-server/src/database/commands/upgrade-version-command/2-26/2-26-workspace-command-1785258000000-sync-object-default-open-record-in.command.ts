import { Command } from 'nest-commander';

import { ViewOpenRecordIn } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.26.0', 1785258000000)
@Command({
  name: 'upgrade:2-26:sync-object-default-open-record-in',
  description:
    'Give existing objects their standard defaultOpenRecordIn and pin full page objects’ views to the record page',
})
export class SyncObjectDefaultOpenRecordInCommand extends ProvisionedWorkspaceCommandRunner {
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
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatObjectMetadataMaps, flatViewMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatViewMaps',
      ]);

    const now = new Date().toISOString();

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now,
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
        canViewsDeferToUserPreference: true,
      });

    const objectMetadatasToUpdate = Object.values(
      standardAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .map((standardObjectMetadata): FlatObjectMetadata | undefined => {
        const existingObjectMetadata =
          flatObjectMetadataMaps.byUniversalIdentifier[
            standardObjectMetadata.universalIdentifier
          ];

        if (
          !isDefined(existingObjectMetadata) ||
          existingObjectMetadata.defaultOpenRecordIn ===
            standardObjectMetadata.defaultOpenRecordIn
        ) {
          return undefined;
        }

        return {
          ...existingObjectMetadata,
          defaultOpenRecordIn: standardObjectMetadata.defaultOpenRecordIn,
          updatedAt: now,
        };
      })
      .filter(isDefined);

    // Views on these objects were already resolving to the record page through
    // a frontend clamp that no longer exists, so they have to say so.
    const recordPageObjectUniversalIdentifiers = new Set(
      objectMetadatasToUpdate
        .filter(
          (objectMetadata) =>
            objectMetadata.defaultOpenRecordIn === ViewOpenRecordIn.RECORD_PAGE,
        )
        .map((objectMetadata) => objectMetadata.universalIdentifier),
    );

    const viewsToUpdate = Object.values(flatViewMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (flatView): flatView is FlatView =>
          recordPageObjectUniversalIdentifiers.has(
            flatView.objectMetadataUniversalIdentifier,
          ) && flatView.openRecordIn !== ViewOpenRecordIn.RECORD_PAGE,
      )
      .map((flatView) => ({
        ...flatView,
        openRecordIn: ViewOpenRecordIn.RECORD_PAGE,
        updatedAt: now,
      }));

    if (objectMetadatasToUpdate.length === 0 && viewsToUpdate.length === 0) {
      this.logger.log(
        `Object defaultOpenRecordIn already up to date for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${objectMetadatasToUpdate.length} object(s) and ${viewsToUpdate.length} view(s) to update`,
    );

    if (isDryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: objectMetadatasToUpdate,
            },
            view: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: viewsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to sync object defaultOpenRecordIn:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to sync object defaultOpenRecordIn for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Synced object defaultOpenRecordIn for workspace ${workspaceId}`,
    );
  }
}
