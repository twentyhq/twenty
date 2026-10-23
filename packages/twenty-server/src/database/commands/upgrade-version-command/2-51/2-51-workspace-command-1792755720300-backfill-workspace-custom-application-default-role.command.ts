import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getAvailableRoleLabel } from 'src/database/commands/upgrade-version-command/2-51/utils/get-available-role-label.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WORKSPACE_CUSTOM_APPLICATION_ROLE_UNIVERSAL_IDENTIFIER } from 'src/engine/core-modules/application/constants/workspace-custom-application-role.constant';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { buildWorkspaceCustomApplicationFlatRole } from 'src/engine/metadata-modules/flat-role/utils/build-workspace-custom-application-flat-role.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.51.0', 1792755720300)
@Command({
  name: 'upgrade:2-51:backfill-workspace-custom-application-default-role',
  description:
    'Give the workspace custom application its own default role',
})
export class BackfillWorkspaceCustomApplicationDefaultRoleCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
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

    if (isDefined(workspaceCustomFlatApplication.defaultRoleId)) {
      return;
    }

    const { flatRoleMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatRoleMaps'],
    );

    const existingCustomApplicationFlatRole =
      findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
        flatEntityMaps: flatRoleMaps,
      });

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would ${isDefined(existingCustomApplicationFlatRole) ? 'reuse' : 'create'} the workspace custom application role`,
      );

      return;
    }

    const customApplicationFlatRole =
      existingCustomApplicationFlatRole ??
      (await this.createWorkspaceCustomApplicationRole({
        workspaceId,
        workspaceCustomFlatApplication,
        takenLabels: Object.values(flatRoleMaps.byUniversalIdentifier)
          .filter(isDefined)
          .map(({ label }) => label),
      }));

    await this.applicationService.update(workspaceCustomFlatApplication.id, {
      workspaceId,
      defaultRoleId: customApplicationFlatRole.id,
    });

    this.logger.log(
      `Workspace ${workspaceId}: set role ${customApplicationFlatRole.id} as the workspace custom application default role`,
    );
  }

  private async createWorkspaceCustomApplicationRole({
    workspaceId,
    workspaceCustomFlatApplication,
    takenLabels,
  }: {
    workspaceId: string;
    workspaceCustomFlatApplication: FlatApplication;
    takenLabels: string[];
  }): Promise<FlatRole> {
    const definitionFlatRole = buildWorkspaceCustomApplicationFlatRole({
      workspaceId,
      workspaceCustomFlatApplication,
    });

    const flatRoleToCreate: FlatRole = {
      ...definitionFlatRole,
      label: getAvailableRoleLabel({
        preferredLabel: definitionFlatRole.label,
        takenLabels,
      }),
    };

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            role: {
              flatEntityToCreate: [flatRoleToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to create the workspace custom application role in workspace ${workspaceId}`,
      );
    }

    return flatRoleToCreate;
  }
}
