import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computeFilesFieldRecordFormWidgetsToCreate } from 'src/database/commands/upgrade-version-command/2-50/utils/compute-files-field-record-form-widgets-to-create.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

@RegisteredWorkspaceCommand('2.50.0', 1792421482633)
@Command({
  name: 'upgrade:2-50:backfill-files-field-record-form-widgets',
  description:
    'Give every FILES field eligible for the record form a FORM_FIELD widget, appended after the existing widgets, so files fields created before 2.50 appear in the create record form',
})
export class BackfillFilesFieldRecordFormWidgetsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    const flatPageLayoutWidgetsToCreate =
      computeFilesFieldRecordFormWidgetsToCreate({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatPageLayoutTabMaps,
        flatPageLayoutWidgetMaps,
      });

    if (flatPageLayoutWidgetsToCreate.length === 0) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would create ${flatPageLayoutWidgetsToCreate.length} record form widget(s) for files fields`,
      );

      return;
    }

    await this.createFlatPageLayoutWidgetsPerApplication({
      workspaceId,
      flatPageLayoutWidgetsToCreate,
    });

    this.logger.log(
      `Workspace ${workspaceId}: created ${flatPageLayoutWidgetsToCreate.length} record form widget(s) for files fields`,
    );
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {}

  private async createFlatPageLayoutWidgetsPerApplication({
    workspaceId,
    flatPageLayoutWidgetsToCreate,
  }: {
    workspaceId: string;
    flatPageLayoutWidgetsToCreate: UniversalFlatPageLayoutWidget[];
  }): Promise<void> {
    const applicationUniversalIdentifiers = new Set(
      flatPageLayoutWidgetsToCreate.map(
        ({ applicationUniversalIdentifier }) => applicationUniversalIdentifier,
      ),
    );

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            workspaceId,
            isSystemBuild: true,
            applicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName: {
              pageLayoutWidget: {
                flatEntityToCreate: flatPageLayoutWidgetsToCreate.filter(
                  (flatPageLayoutWidget) =>
                    flatPageLayoutWidget.applicationUniversalIdentifier ===
                    applicationUniversalIdentifier,
                ),
                flatEntityToUpdate: [],
                flatEntityToDelete: [],
              },
            },
          },
        );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to backfill files field record form widgets of application ${applicationUniversalIdentifier} in workspace ${workspaceId}`,
        );
      }
    }
  }
}
