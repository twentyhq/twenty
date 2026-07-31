import { Command } from 'nest-commander';

import {
  ObjectOpenRecordIn,
  ViewKey,
  ViewOpenRecordIn,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
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
  // Workspace-invariant, so the standard application is only built once per run.
  private standardOpenRecordInByUniversalIdentifier?: Record<
    string,
    ObjectOpenRecordIn
  >;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  private async getStandardOpenRecordInByUniversalIdentifier(
    workspaceId: string,
  ): Promise<Record<string, ObjectOpenRecordIn>> {
    if (isDefined(this.standardOpenRecordInByUniversalIdentifier)) {
      return this.standardOpenRecordInByUniversalIdentifier;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    this.standardOpenRecordInByUniversalIdentifier = Object.fromEntries(
      Object.values(
        standardAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter(
          (standardObjectMetadata) =>
            standardObjectMetadata.openRecordIn !==
            ObjectOpenRecordIn.USER_CHOICE,
        )
        .map((standardObjectMetadata) => [
          standardObjectMetadata.universalIdentifier,
          standardObjectMetadata.openRecordIn,
        ]),
    );

    return this.standardOpenRecordInByUniversalIdentifier;
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatObjectMetadataMaps, flatViewMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatViewMaps',
      ]);

    const targetOpenRecordInByUniversalIdentifier: Record<
      string,
      ObjectOpenRecordIn
    > = {
      ...(await this.getStandardOpenRecordInByUniversalIdentifier(workspaceId)),
    };

    // A deliberate per-view record page choice is lifted to the object, unless
    // the standard definitions already pin that object.
    for (const flatView of Object.values(flatViewMaps.byUniversalIdentifier)) {
      if (
        isDefined(flatView) &&
        flatView.key === ViewKey.INDEX &&
        flatView.openRecordIn === ViewOpenRecordIn.RECORD_PAGE &&
        !isDefined(
          targetOpenRecordInByUniversalIdentifier[
            flatView.objectMetadataUniversalIdentifier
          ],
        )
      ) {
        targetOpenRecordInByUniversalIdentifier[
          flatView.objectMetadataUniversalIdentifier
        ] = ObjectOpenRecordIn.RECORD_PAGE;
      }
    }

    const now = new Date().toISOString();

    const objectMetadatasToUpdate = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .flatMap((flatObjectMetadata) => {
        const targetOpenRecordIn =
          targetOpenRecordInByUniversalIdentifier[
            flatObjectMetadata.universalIdentifier
          ];

        if (
          !isDefined(targetOpenRecordIn) ||
          flatObjectMetadata.openRecordIn === targetOpenRecordIn
        ) {
          return [];
        }

        return [
          {
            ...flatObjectMetadata,
            openRecordIn: targetOpenRecordIn,
            updatedAt: now,
          },
        ];
      });

    if (objectMetadatasToUpdate.length === 0) {
      this.logger.log(
        `Object openRecordIn already seeded for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: seeding openRecordIn on ${objectMetadatasToUpdate.length} object(s)`,
    );

    if (isDryRun) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

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
