import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { findWorkspaceAuthContextEntry } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContextEntry } from 'src/engine/core-modules/auth/types/workspace-auth-context-entry.type';
import { type OperationPolicy } from 'src/engine/core-modules/authorization/types/operation-policy.type';
import { AuthPrincipalRefusedException } from 'src/engine/guards/exceptions/auth-principal-refused.exception';
import { isAuthPrincipalVariantAccepted } from 'src/engine/guards/utils/is-auth-principal-variant-accepted.util';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Flags are not checked while the workspace is being created, as settings guards did
const WORKSPACE_ACTIVATION_STATUSES_BEFORE_ACTIVATION: (
  | WorkspaceActivationStatus
  | undefined
)[] = [
  WorkspaceActivationStatus.PENDING_CREATION,
  WorkspaceActivationStatus.ONGOING_CREATION,
];

// Evaluates an operation policy against the current flow's entry. A policy that passes leaves a
// receipt on the entry, so the service an adapter calls into does not evaluate it again.
@Injectable()
export class OperationAuthorizationService {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async isAllowed({
    policy,
    entry,
  }: {
    policy: OperationPolicy;
    entry: WorkspaceAuthContextEntry;
  }): Promise<boolean> {
    const { principal } = entry;

    if (principal.kind === 'unattested' || entry.isRefusedByOuterNarrowing) {
      return false;
    }

    if (
      principal.kind !== 'system' &&
      !isAuthPrincipalVariantAccepted({
        authPrincipalGuardConfig: policy.authPrincipal,
        authPrincipalVariant: principal,
      })
    ) {
      return false;
    }

    if (
      policy.permissionFlags.length === 0 ||
      WORKSPACE_ACTIVATION_STATUSES_BEFORE_ACTIVATION.includes(
        entry.authContext.workspace.activationStatus,
      )
    ) {
      return true;
    }

    const rolePermissionConfig =
      await this.resolveEntryRolePermissionConfig(entry);

    if (!isDefined(rolePermissionConfig)) {
      return false;
    }

    for (const permissionFlag of policy.permissionFlags) {
      const isGranted = await this.permissionsService.checkRolesPermissions(
        rolePermissionConfig,
        entry.authContext.workspace.id,
        permissionFlag,
      );

      if (!isGranted) {
        return false;
      }
    }

    return true;
  }

  async isCurrentFlowAllowed(policy: OperationPolicy): Promise<boolean> {
    const entry = findWorkspaceAuthContextEntry();

    return isDefined(entry) && (await this.isAllowed({ policy, entry }));
  }

  async authorizeOrThrow(policy: OperationPolicy): Promise<void> {
    const entry = findWorkspaceAuthContextEntry();

    if (!isDefined(entry) || !(await this.isAllowed({ policy, entry }))) {
      throw new AuthPrincipalRefusedException();
    }

    entry.authorizedOperationNames.add(policy.name);
  }

  async ensureAuthorized(policy: OperationPolicy): Promise<void> {
    const entry = findWorkspaceAuthContextEntry();

    if (entry?.authorizedOperationNames.has(policy.name) === true) {
      return;
    }

    await this.authorizeOrThrow(policy);
  }

  // The entry's own narrowing, or the roles the ORM would derive from its auth context
  private async resolveEntryRolePermissionConfig(
    entry: WorkspaceAuthContextEntry,
  ): Promise<RolePermissionConfig | null> {
    if (entry.principal.kind === 'system') {
      return { shouldBypassPermissionChecks: true };
    }

    if (isDefined(entry.rolePermissionConfig)) {
      return entry.rolePermissionConfig;
    }

    const { userWorkspaceRoleMap, apiKeyRoleMap, flatRoleTargetByAgentIdMaps } =
      await this.workspaceCacheService.getOrRecompute(
        entry.authContext.workspace.id,
        [
          'userWorkspaceRoleMap',
          'apiKeyRoleMap',
          'flatRoleTargetByAgentIdMaps',
        ],
      );

    // A member whose workspace member is not resolved yet acts with their role, as settings guards did
    if (entry.authContext.type === 'pendingActivationUser') {
      return {
        intersectionOf: {
          userWorkspaceRoleId:
            userWorkspaceRoleMap[entry.authContext.userWorkspaceId] ?? null,
        },
      };
    }

    return resolveRolePermissionConfig({
      authContext: entry.authContext,
      userWorkspaceRoleMap,
      apiKeyRoleMap,
      flatRoleTargetByAgentIdMaps,
    });
  }
}
