import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { findMarketplaceFlatApplications } from 'src/database/commands/upgrade-version-command/2-66/utils/find-marketplace-flat-applications.util';
import {
  buildMarketplaceApplicationRoleOperations,
  type MarketplaceApplicationRoleMigrationPlan,
  type MarketplaceApplicationRoleMigrationSummary,
  type PendingInvitation,
  planMarketplaceApplicationRoleMigration,
} from 'src/database/commands/upgrade-version-command/2-66/utils/plan-marketplace-application-role-migration.util';
import { AppTokenType } from 'src/engine/core-modules/app-token/app-token.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const formatSummary = (summary: MarketplaceApplicationRoleMigrationSummary) =>
  [
    `${summary.rolesCloned} role(s) cloned`,
    `holders moved: ${summary.membersMoved} member(s), ${summary.apiKeysMoved} API key(s), ${summary.webhooksMoved} webhook(s), ${summary.agentsMoved} agent(s)`,
    `${summary.defaultRolesMoved} default role(s) moved`,
    `${summary.invitationsRepointed} invitation(s) repointed`,
    `${summary.objectPermissionsWidened} object permission(s) widened from rules`,
    `rows dropped: ${summary.rulesDropped} rule(s), ${summary.predicateGroupsDropped} predicate group(s), ${summary.predicatesDropped} predicate(s), ${summary.fieldPermissionsDropped} field permission(s)`,
    `${summary.rolesMadeAgentOnly} role(s) made agent-only`,
  ].join('; ');

@RegisteredWorkspaceCommand('2.66.0', 1795788995670)
@Command({
  name: 'upgrade:2-66:move-marketplace-application-role-holders-to-cloned-roles',
  description:
    'Move every holder of a marketplace app requested or agent role, other than its own agents, to a workspace-owned copy, then make the original agent-only without rules or field permissions',
})
export class MoveMarketplaceApplicationRoleHoldersToClonedRolesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    const failedApplicationUniversalIdentifiers: string[] = [];

    for (const flatApplication of findMarketplaceFlatApplications({
      flatApplicationMaps,
      workspaceCustomApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    })) {
      const isSuccess = await this.migrateApplicationRoles({
        workspaceId,
        flatApplication,
        workspaceCustomApplicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        isDryRun,
      });

      if (!isSuccess) {
        failedApplicationUniversalIdentifiers.push(
          flatApplication.universalIdentifier,
        );
      }
    }

    if (failedApplicationUniversalIdentifiers.length > 0) {
      throw new Error(
        `Workspace ${workspaceId}: could not move the role holders of applications ${failedApplicationUniversalIdentifiers.join(', ')}`,
      );
    }
  }

  private async migrateApplicationRoles({
    workspaceId,
    flatApplication,
    workspaceCustomApplicationUniversalIdentifier,
    isDryRun,
  }: {
    workspaceId: string;
    flatApplication: FlatApplication;
    workspaceCustomApplicationUniversalIdentifier: string;
    isDryRun: boolean;
  }): Promise<boolean> {
    // Reloaded for each application so clone labels stay unique across the batch
    const {
      flatRoleMaps,
      flatRoleTargetMaps,
      flatAgentMaps,
      flatObjectPermissionMaps,
      flatFieldPermissionMaps,
      flatRolePermissionFlagMaps,
      flatRowLevelPermissionRuleMaps,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatRoleMaps',
      'flatRoleTargetMaps',
      'flatAgentMaps',
      'flatObjectPermissionMaps',
      'flatFieldPermissionMaps',
      'flatRolePermissionFlagMaps',
      'flatRowLevelPermissionRuleMaps',
      'flatRowLevelPermissionPredicateMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
    ]);

    const now = new Date().toISOString();

    const plans = planMarketplaceApplicationRoleMigration({
      flatApplication,
      workspaceCustomApplicationUniversalIdentifier,
      workspaceDefaultRoleId:
        await this.findWorkspaceDefaultRoleId(workspaceId),
      pendingInvitations: await this.findPendingInvitations(workspaceId),
      flatEntityMaps: {
        flatRoleMaps,
        flatObjectPermissionMaps,
        flatFieldPermissionMaps,
        flatRolePermissionFlagMaps,
        flatRowLevelPermissionRuleMaps,
        flatRowLevelPermissionPredicateMaps,
        flatRowLevelPermissionPredicateGroupMaps,
      },
      flatRoleTargetMaps,
      flatAgentMaps,
      generateId: v4,
      now,
    });

    const {
      workspaceCustomApplicationOperations,
      applicationOperations,
      summary,
    } = buildMarketplaceApplicationRoleOperations({ plans, now });

    const hasWorkspaceReferencesToRepoint =
      summary.defaultRolesMoved > 0 || summary.invitationsRepointed > 0;

    if (
      Object.keys(workspaceCustomApplicationOperations).length === 0 &&
      Object.keys(applicationOperations).length === 0 &&
      !hasWorkspaceReferencesToRepoint
    ) {
      return true;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}, application ${flatApplication.universalIdentifier}: ${formatSummary(summary)}`,
    );

    if (Object.keys(workspaceCustomApplicationOperations).length > 0) {
      const cloneResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            workspaceId,
            isSystemBuild: true,
            dryRun: isDryRun,
            applicationUniversalIdentifier:
              workspaceCustomApplicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName:
              workspaceCustomApplicationOperations,
          },
        );

      if (cloneResult.status === 'fail') {
        this.logger.error(
          `Workspace ${workspaceId}: could not clone the roles of application ${flatApplication.universalIdentifier}: ${JSON.stringify(cloneResult.report)}`,
        );

        return false;
      }
    }

    if (!isDryRun && hasWorkspaceReferencesToRepoint) {
      await this.repointWorkspaceReferences({ workspaceId, plans });
    }

    if (Object.keys(applicationOperations).length > 0) {
      const cleanupResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            workspaceId,
            isSystemBuild: true,
            dryRun: isDryRun,
            applicationUniversalIdentifier: flatApplication.universalIdentifier,
            allFlatEntityOperationByMetadataName: applicationOperations,
          },
        );

      if (cleanupResult.status === 'fail') {
        this.logger.error(
          `Workspace ${workspaceId}: could not clean up the roles of application ${flatApplication.universalIdentifier}: ${JSON.stringify(cleanupResult.report)}`,
        );

        return false;
      }
    }

    return true;
  }

  private async findWorkspaceDefaultRoleId(
    workspaceId: string,
  ): Promise<string | null> {
    const [workspace] = await this.coreDataSource.query(
      `SELECT "defaultRoleId" FROM core."workspace" WHERE id = $1`,
      [workspaceId],
    );

    return workspace?.defaultRoleId ?? null;
  }

  private async findPendingInvitations(
    workspaceId: string,
  ): Promise<PendingInvitation[]> {
    return await this.coreDataSource.query(
      `SELECT id, context->>'roleId' AS "roleId" FROM core."appToken"
       WHERE "workspaceId" = $1 AND type = $2 AND "deletedAt" IS NULL AND "revokedAt" IS NULL
       AND context->>'roleId' IS NOT NULL`,
      [workspaceId, AppTokenType.InvitationToken],
    );
  }

  private async repointWorkspaceReferences({
    workspaceId,
    plans,
  }: {
    workspaceId: string;
    plans: MarketplaceApplicationRoleMigrationPlan[];
  }): Promise<void> {
    for (const { originalFlatRole, holderMove } of plans) {
      if (!isDefined(holderMove)) {
        continue;
      }

      if (holderMove.isWorkspaceDefaultRole) {
        await this.coreDataSource.query(
          `UPDATE core."workspace" SET "defaultRoleId" = $1 WHERE id = $2 AND "defaultRoleId" = $3`,
          [holderMove.cloneRoleId, workspaceId, originalFlatRole.id],
        );
        await this.coreEntityCacheService.invalidate(
          'workspaceEntity',
          workspaceId,
        );
      }

      if (holderMove.invitationIds.length > 0) {
        await this.coreDataSource.query(
          `UPDATE core."appToken" SET context = jsonb_set(context, '{roleId}', to_jsonb($1::text))
           WHERE "workspaceId" = $2 AND id = ANY($3::uuid[])`,
          [holderMove.cloneRoleId, workspaceId, holderMove.invitationIds],
        );
      }
    }
  }
}
