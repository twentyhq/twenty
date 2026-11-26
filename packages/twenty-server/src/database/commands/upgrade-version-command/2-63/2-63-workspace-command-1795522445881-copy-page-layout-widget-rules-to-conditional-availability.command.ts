import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computePageLayoutWidgetWithCopiedConditionalAvailability } from 'src/database/commands/upgrade-version-command/2-63/utils/compute-page-layout-widget-with-copied-conditional-availability.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Nothing is emptied: a workspace whose flag is turned off again reads its legacy values as before
@RegisteredWorkspaceCommand('2.63.0', 1795522445881)
@Command({
  name: 'upgrade:2-63:copy-page-layout-widget-rules-to-conditional-availability',
  description:
    'Copy the visibility rule of page layout widgets, from its text and json-logic forms, into its tree form, then make the workspace read the tree only',
})
export class CopyPageLayoutWidgetRulesToConditionalAvailabilityCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly featureFlagService: FeatureFlagService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatPageLayoutWidgetMaps, flatPageLayoutTabMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPageLayoutWidgetMaps',
        'flatPageLayoutTabMaps',
      ]);

    const now = new Date().toISOString();

    const computedPageLayoutWidgets = Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatPageLayoutWidget) => !isDefined(flatPageLayoutWidget.deletedAt),
      )
      .map((flatPageLayoutWidget) => ({
        universalIdentifier: flatPageLayoutWidget.universalIdentifier,
        ...computePageLayoutWidgetWithCopiedConditionalAvailability({
          flatPageLayoutWidget,
          workspaceCustomApplicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          pageLayoutTabUniversalIdentifierById:
            flatPageLayoutTabMaps.universalIdentifierById,
          now,
        }),
      }));

    for (const {
      universalIdentifier,
      unreadableRuleMessages,
    } of computedPageLayoutWidgets) {
      for (const unreadableRuleMessage of unreadableRuleMessages) {
        this.logger.warn(
          `Workspace ${workspaceId}: a rule of page layout widget ${universalIdentifier} could not be read and is left as it is (${unreadableRuleMessage})`,
        );
      }
    }

    const pageLayoutWidgetsToUpdate = computedPageLayoutWidgets
      .map(({ pageLayoutWidgetToUpdate }) => pageLayoutWidgetToUpdate)
      .filter(isDefined);

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: copying the rule of ${pageLayoutWidgetsToUpdate.length} page layout widget(s) into a tree`,
    );

    if (options.dryRun) {
      return;
    }

    if (isNonEmptyArray(pageLayoutWidgetsToUpdate)) {
      await this.updatePageLayoutWidgetsOrThrow({
        workspaceId,
        pageLayoutWidgetsToUpdate,
      });
    }

    const hasUnreadableRule = computedPageLayoutWidgets.some(
      ({ unreadableRuleMessages }) => isNonEmptyArray(unreadableRuleMessages),
    );

    if (hasUnreadableRule) {
      this.logger.warn(
        `Workspace ${workspaceId}: ${FeatureFlagKey.IS_WIDGET_CONDITIONAL_AVAILABILITY_ENABLED} stays off because a rule could not be read`,
      );

      return;
    }

    await this.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId,
      featureFlag: FeatureFlagKey.IS_WIDGET_CONDITIONAL_AVAILABILITY_ENABLED,
      value: true,
    });
  }

  private async updatePageLayoutWidgetsOrThrow({
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
