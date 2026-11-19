import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computePageLayoutWidgetWithConditionalAvailability } from 'src/database/commands/upgrade-version-command/2-61/utils/compute-page-layout-widget-with-conditional-availability.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.61.0', 1795111495560)
@Command({
  name: 'upgrade:2-61:convert-page-layout-widget-rules-to-conditional-availability',
  description:
    'Store the visibility rule of page layout widgets as a tree, from its text and json-logic forms',
})
export class ConvertPageLayoutWidgetRulesToConditionalAvailabilityCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { workspaceCustomFlatApplication, twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatPageLayoutWidgetMaps, flatPageLayoutTabMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPageLayoutWidgetMaps',
        'flatPageLayoutTabMaps',
      ]);

    const now = new Date().toISOString();

    const {
      allFlatEntityMaps: {
        flatPageLayoutWidgetMaps: standardFlatPageLayoutWidgetMaps,
      },
    } = computeTwentyStandardApplicationAllFlatEntityMaps({
      now,
      workspaceId,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
    });

    const pageLayoutWidgetsToUpdate = Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatPageLayoutWidget) => !isDefined(flatPageLayoutWidget.deletedAt),
      )
      .flatMap((flatPageLayoutWidget) => {
        const conversion = computePageLayoutWidgetWithConditionalAvailability({
          flatPageLayoutWidget,
          standardConditionalAvailability:
            flatPageLayoutWidget.applicationUniversalIdentifier ===
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
              ? standardFlatPageLayoutWidgetMaps.byUniversalIdentifier[
                  flatPageLayoutWidget.universalIdentifier
                ]?.conditionalAvailability
              : undefined,
          workspaceCustomApplicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          pageLayoutTabUniversalIdentifierById:
            flatPageLayoutTabMaps.universalIdentifierById,
          now,
        });

        if (!isDefined(conversion)) {
          return [];
        }

        if (isDefined(conversion.unreadableRuleReason)) {
          this.logger.warn(
            `Workspace ${workspaceId}: the rule of page layout widget ${flatPageLayoutWidget.universalIdentifier} could not be read, the widget is now hidden (${conversion.unreadableRuleReason})`,
          );
        }

        return [conversion.flatPageLayoutWidget];
      });

    if (!isNonEmptyArray(pageLayoutWidgetsToUpdate)) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: storing the rule of ${pageLayoutWidgetsToUpdate.length} page layout widget(s) as a tree`,
    );

    if (options.dryRun) {
      return;
    }

    await this.updatePageLayoutWidgets({
      workspaceId,
      pageLayoutWidgetsToUpdate,
    });
  }

  private async updatePageLayoutWidgets({
    workspaceId,
    pageLayoutWidgetsToUpdate,
  }: {
    workspaceId: string;
    pageLayoutWidgetsToUpdate: FlatPageLayoutWidget[];
  }): Promise<void> {
    const applicationUniversalIdentifiers = [
      ...new Set(
        pageLayoutWidgetsToUpdate.map(
          (pageLayoutWidget) => pageLayoutWidget.applicationUniversalIdentifier,
        ),
      ),
    ];

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
      const migrationArgs = {
        shouldDeferActions: false,
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          pageLayoutWidget: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: pageLayoutWidgetsToUpdate.filter(
              (pageLayoutWidget) =>
                pageLayoutWidget.applicationUniversalIdentifier ===
                applicationUniversalIdentifier,
            ),
          },
        },
      };

      const result =
        applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              migrationArgs,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              migrationArgs,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(result);
      }
    }
  }
}
