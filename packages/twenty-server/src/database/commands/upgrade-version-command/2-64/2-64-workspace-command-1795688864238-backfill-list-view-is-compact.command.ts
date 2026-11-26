import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildCompactListFlatViewUpdates } from 'src/database/commands/upgrade-version-command/2-64/utils/build-compact-list-flat-view-updates.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.64.0', 1795688864238)
@Command({
  name: 'upgrade:2-64:backfill-list-view-is-compact',
  description:
    'Turn Compact view on for existing list views, so they keep their row once lists read the setting',
})
export class BackfillListViewIsCompactCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatViewMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatViewMaps',
        'flatFieldMetadataMaps',
      ]);

    const compactListFlatViewUpdates = buildCompactListFlatViewUpdates({
      flatViews: Object.values(flatViewMaps.byUniversalIdentifier).filter(
        isDefined,
      ),
      fieldMetadataUniversalIdentifierById:
        flatFieldMetadataMaps.universalIdentifierById,
      workspaceCustomApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      now: new Date().toISOString(),
    });

    if (compactListFlatViewUpdates.length === 0) {
      return;
    }

    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${compactListFlatViewUpdates.length} list view(s) to set to compact`,
    );

    if (isDryRun) {
      return;
    }

    const writerApplicationUniversalIdentifiers = new Set(
      compactListFlatViewUpdates.map(
        ({ writerApplicationUniversalIdentifier }) =>
          writerApplicationUniversalIdentifier,
      ),
    );

    for (const writerApplicationUniversalIdentifier of writerApplicationUniversalIdentifiers) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            isSystemBuild: true,
            workspaceId,
            applicationUniversalIdentifier: writerApplicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName: {
              view: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: compactListFlatViewUpdates
                  .filter(
                    (compactListFlatViewUpdate) =>
                      compactListFlatViewUpdate.writerApplicationUniversalIdentifier ===
                      writerApplicationUniversalIdentifier,
                  )
                  .map(({ flatView }) => flatView),
              },
            },
          },
        );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(result);
      }
    }
  }
}
