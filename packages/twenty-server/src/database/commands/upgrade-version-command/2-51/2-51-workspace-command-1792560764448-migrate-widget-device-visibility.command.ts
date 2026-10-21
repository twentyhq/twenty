import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { fastDeepEqual, isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { type WidgetVisibility } from 'src/database/commands/upgrade-version-command/2-51/types/widget-visibility.type';
import { migrateWidgetDeviceVisibility } from 'src/database/commands/upgrade-version-command/2-51/utils/migrate-widget-device-visibility.util';
import { revertWidgetDeviceVisibility } from 'src/database/commands/upgrade-version-command/2-51/utils/revert-widget-device-visibility.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type OverrideAuthorContext } from 'src/engine/metadata-modules/overrides/types/override-author-context.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

type TransformWidgetVisibility = (
  args: WidgetVisibility & { authorContext: OverrideAuthorContext },
) => WidgetVisibility & { nulledConditionalDisplays?: unknown[] };

@RegisteredWorkspaceCommand('2.51.0', 1792560764448)
@Command({
  name: 'upgrade:2-51:migrate-widget-device-visibility',
  description:
    'Move the device visibility of page layout widgets and their overrides from conditionalAvailabilityExpression and json-logic conditionalDisplay to a conditionalDisplay device rule',
})
export class MigrateWidgetDeviceVisibilityCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.transformWidgets({
      ...args,
      transformWidgetVisibility: migrateWidgetDeviceVisibility,
    });
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.transformWidgets({
      ...args,
      transformWidgetVisibility: revertWidgetDeviceVisibility,
    });
  }

  private async transformWidgets({
    workspaceId,
    options,
    transformWidgetVisibility,
  }: RunOnWorkspaceArgs & {
    transformWidgetVisibility: TransformWidgetVisibility;
  }): Promise<void> {
    const { flatPageLayoutWidgetMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPageLayoutWidgetMaps',
      ]);

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const now = new Date().toISOString();
    const widgetsToUpdate = Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .flatMap((flatPageLayoutWidget) => {
        const authorContext = {
          workspaceCustomApplicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          ownerApplicationUniversalIdentifier:
            flatPageLayoutWidget.applicationUniversalIdentifier,
        };
        const transformedVisibility = transformWidgetVisibility({
          conditionalDisplay: flatPageLayoutWidget.conditionalDisplay,
          conditionalAvailabilityExpression:
            flatPageLayoutWidget.conditionalAvailabilityExpression,
          overrides: flatPageLayoutWidget.overrides,
          authorContext,
        });
        const transformedUniversalVisibility = transformWidgetVisibility({
          conditionalDisplay: flatPageLayoutWidget.universalConditionalDisplay,
          conditionalAvailabilityExpression:
            flatPageLayoutWidget.conditionalAvailabilityExpression,
          overrides: flatPageLayoutWidget.universalOverrides,
          authorContext,
        });

        const transformedWidget = {
          ...flatPageLayoutWidget,
          conditionalDisplay:
            transformedVisibility.conditionalDisplay as FlatPageLayoutWidget['conditionalDisplay'],
          conditionalAvailabilityExpression:
            transformedVisibility.conditionalAvailabilityExpression,
          overrides:
            transformedVisibility.overrides as FlatPageLayoutWidget['overrides'],
          universalConditionalDisplay:
            transformedUniversalVisibility.conditionalDisplay as FlatPageLayoutWidget['universalConditionalDisplay'],
          universalOverrides:
            transformedUniversalVisibility.overrides as FlatPageLayoutWidget['universalOverrides'],
        };

        if (fastDeepEqual(transformedWidget, flatPageLayoutWidget)) {
          return [];
        }

        if (isNonEmptyArray(transformedVisibility.nulledConditionalDisplays)) {
          this.logger.warn(
            `Workspace ${workspaceId}: dropping unsupported conditionalDisplay of page layout widget ${flatPageLayoutWidget.universalIdentifier}: ${JSON.stringify(transformedVisibility.nulledConditionalDisplays)}`,
          );
        }

        return [{ ...transformedWidget, updatedAt: now }];
      });

    if (!isNonEmptyArray(widgetsToUpdate)) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: updating the device visibility of ${widgetsToUpdate.length} page layout widget(s)`,
    );

    if (options.dryRun) {
      return;
    }

    const applicationUniversalIdentifiers = new Set(
      widgetsToUpdate.map(
        ({ applicationUniversalIdentifier }) => applicationUniversalIdentifier,
      ),
    );

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
      const args = {
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          pageLayoutWidget: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: widgetsToUpdate.filter(
              (widget) =>
                widget.applicationUniversalIdentifier ===
                applicationUniversalIdentifier,
            ),
          },
        },
      };

      const result =
        applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              args,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              args,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to update the device visibility of page layout widgets of application ${applicationUniversalIdentifier} in workspace ${workspaceId}`,
        );
      }
    }
  }
}
