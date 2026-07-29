import { Command } from 'nest-commander';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computeViewFieldPositionsAlignedToStandard } from 'src/database/commands/upgrade-version-command/2-26/utils/compute-view-field-positions-aligned-to-standard.util';
import { splitViewFieldPositionUpdates } from 'src/database/commands/upgrade-version-command/2-26/utils/split-view-field-position-updates.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const ALL_MESSAGE_CAMPAIGNS_VIEW_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageCampaign.views.allMessageCampaigns
    .universalIdentifier;

@RegisteredWorkspaceCommand('2.26.0', 1785325400000)
@Command({
  name: 'upgrade:2-26:align-message-campaign-view-field-positions',
  description:
    'Align the all campaigns view columns with the standard layout so the name label identifier sits strictly first and the standard-application sync stops trying to move it back',
})
export class AlignMessageCampaignViewFieldPositionsCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { flatViewMaps, flatViewFieldMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatViewMaps',
        'flatViewFieldMaps',
      ]);

    const existingView =
      flatViewMaps.byUniversalIdentifier[
        ALL_MESSAGE_CAMPAIGNS_VIEW_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(existingView)) {
      this.logger.log(
        `All campaigns view does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
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

    const standardPositionByUniversalIdentifier = Object.fromEntries(
      Object.values(
        standardAllFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter(
          (viewField) =>
            viewField.viewUniversalIdentifier ===
            ALL_MESSAGE_CAMPAIGNS_VIEW_UNIVERSAL_IDENTIFIER,
        )
        .map(({ universalIdentifier, position }) => [
          universalIdentifier,
          position,
        ]),
    );

    const existingViewFields = existingView.viewFieldUniversalIdentifiers
      .map(
        (viewFieldUniversalIdentifier) =>
          flatViewFieldMaps.byUniversalIdentifier[viewFieldUniversalIdentifier],
      )
      .filter(isDefined);

    const positionUpdates = computeViewFieldPositionsAlignedToStandard({
      existingViewFields: existingViewFields.map(
        ({ universalIdentifier, position }) => ({
          universalIdentifier,
          position,
        }),
      ),
      standardPositionByUniversalIdentifier,
    });

    const viewFieldsToUpdate = positionUpdates
      .map(({ universalIdentifier, position }) => {
        const existingViewField =
          flatViewFieldMaps.byUniversalIdentifier[universalIdentifier];

        return isDefined(existingViewField)
          ? { ...existingViewField, position }
          : null;
      })
      .filter((viewField): viewField is FlatViewField => isDefined(viewField));

    if (viewFieldsToUpdate.length === 0) {
      this.logger.log(
        `All campaigns view columns already match the standard layout for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Aligning ${viewFieldsToUpdate.length} all campaigns view column(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { others, lowest } = splitViewFieldPositionUpdates(viewFieldsToUpdate);

    for (const viewFieldBatch of [others, lowest]) {
      if (viewFieldBatch.length === 0) {
        continue;
      }

      await this.runViewFieldUpdates({
        workspaceId,
        applicationUniversalIdentifier:
          twentyStandardFlatApplication.universalIdentifier,
        viewFieldsToUpdate: viewFieldBatch,
      });
    }

    this.logger.log(
      `Aligned the all campaigns view columns for workspace ${workspaceId}`,
    );
  }

  private async runViewFieldUpdates({
    workspaceId,
    applicationUniversalIdentifier,
    viewFieldsToUpdate,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    viewFieldsToUpdate: FlatViewField[];
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier,
          allFlatEntityOperationByMetadataName: {
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: viewFieldsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to align the all campaigns view columns:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to align the all campaigns view columns for workspace ${workspaceId}`,
      );
    }
  }
}
