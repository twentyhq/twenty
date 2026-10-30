import { Command } from 'nest-commander';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { fromCreateRoleTargetInputToFlatRoleTargetToCreate } from 'src/engine/metadata-modules/role-target/utils/from-create-role-target-input-to-flat-role-target-to-create.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

@RegisteredWorkspaceCommand('2.54.0', 1793355434587)
@Command({
  name: 'upgrade:2-54:backfill-webhook-admin-role',
  description: 'Attach the Admin role to every webhook that has no role yet',
})
export class BackfillWebhookAdminRoleCommand extends ProvisionedWorkspaceCommandRunner {
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
    const {
      flatWebhookMaps,
      flatRoleMaps,
      flatRoleTargetMaps,
      flatAgentMaps,
      webhookRoleMap,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatWebhookMaps',
      'flatRoleMaps',
      'flatRoleTargetMaps',
      'flatAgentMaps',
      'webhookRoleMap',
    ]);

    const webhookIdsWithoutRole = Object.values(
      flatWebhookMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((flatWebhook) => !isDefined(webhookRoleMap[flatWebhook.id]))
      .map((flatWebhook) => flatWebhook.id);

    if (!isNonEmptyArray(webhookIdsWithoutRole)) {
      return;
    }

    const adminFlatRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
      flatEntityMaps: flatRoleMaps,
    });

    if (!isDefined(adminFlatRole)) {
      this.logger.warn(
        `Workspace ${workspaceId}: no Admin role, ${webhookIdsWithoutRole.length} webhook(s) left without a role`,
      );

      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: attaching the Admin role to ${webhookIdsWithoutRole.length} webhook(s)`,
    );

    if (options.dryRun) {
      return;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatRoleTargetsToCreate = webhookIdsWithoutRole.map(
      (webhookId) =>
        fromCreateRoleTargetInputToFlatRoleTargetToCreate({
          createRoleTargetInput: {
            roleId: adminFlatRole.id,
            targetId: webhookId,
            targetMetadataForeignKey: 'webhookId',
          },
          workspaceId,
          flatRoleTargetMaps,
          flatRoleMaps,
          flatAgentMaps,
          flatWebhookMaps,
          flatApplication: workspaceCustomFlatApplication,
        }).flatRoleTargetToCreate,
    );

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            roleTarget: {
              flatEntityToCreate: flatRoleTargetsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
