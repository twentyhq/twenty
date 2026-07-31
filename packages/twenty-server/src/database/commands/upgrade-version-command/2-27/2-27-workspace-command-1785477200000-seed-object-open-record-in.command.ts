import { Command } from 'nest-commander';

import { ObjectOpenRecordIn, ViewKey, ViewOpenRecordIn } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.27.0', 1785477200000)
@Command({
  name: 'upgrade:2-27:seed-object-open-record-in',
  description:
    'Seed objectMetadata.openRecordIn from the standard definitions and from deliberate per-view record page choices',
})
export class SeedObjectOpenRecordInCommand extends ProvisionedWorkspaceCommandRunner {
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
      });

    // The column arrives as USER_CHOICE everywhere, so two kinds of objects
    // have to be told otherwise: standard objects the definitions pin, and
    // objects whose index view had been deliberately switched to the record
    // page back when the view was the only place to say so.
    const pinnedUniversalIdentifiers = new Set<string>();

    for (const standardObjectMetadata of Object.values(
      standardAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    )) {
      if (
        isDefined(standardObjectMetadata) &&
        standardObjectMetadata.openRecordIn === ObjectOpenRecordIn.RECORD_PAGE
      ) {
        pinnedUniversalIdentifiers.add(
          standardObjectMetadata.universalIdentifier,
        );
      }
    }

    for (const flatView of Object.values(flatViewMaps.byUniversalIdentifier)) {
      if (
        isDefined(flatView) &&
        flatView.key === ViewKey.INDEX &&
        flatView.openRecordIn === ViewOpenRecordIn.RECORD_PAGE
      ) {
        pinnedUniversalIdentifiers.add(
          flatView.objectMetadataUniversalIdentifier,
        );
      }
    }

    const objectMetadatasToUpdate = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatObjectMetadata): flatObjectMetadata is FlatObjectMetadata =>
          pinnedUniversalIdentifiers.has(
            flatObjectMetadata.universalIdentifier,
          ) &&
          flatObjectMetadata.openRecordIn !== ObjectOpenRecordIn.RECORD_PAGE,
      )
      .map((flatObjectMetadata) => ({
        ...flatObjectMetadata,
        openRecordIn: ObjectOpenRecordIn.RECORD_PAGE,
        updatedAt: now,
      }));

    if (objectMetadatasToUpdate.length === 0) {
      this.logger.log(
        `Object openRecordIn already seeded for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: pinning ${objectMetadatasToUpdate.length} object(s) to the record page`,
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
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to seed object openRecordIn:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to seed object openRecordIn for workspace ${workspaceId}`,
      );
    }

    this.logger.log(`Seeded object openRecordIn for workspace ${workspaceId}`);
  }
}
