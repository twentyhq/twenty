import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { findWorkspaceAuthContextEntry } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContextEntry } from 'src/engine/core-modules/auth/types/workspace-auth-context-entry.type';
import { ApplicationReachService } from 'src/engine/core-modules/authorization/application-reach/services/application-reach.service';
import { type OperationPolicy } from 'src/engine/core-modules/authorization/types/operation-policy.type';
import { type OperationTarget } from 'src/engine/core-modules/authorization/types/operation-target.type';
import { AuthPrincipalRefusedException } from 'src/engine/guards/exceptions/auth-principal-refused.exception';
import { isAuthPrincipalVariantAccepted } from 'src/engine/guards/utils/is-auth-principal-variant-accepted.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
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
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationReachService: ApplicationReachService,
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

  // A receipt names the operation, and the target it was checked on when there is one
  async ensureAuthorized(
    policy: OperationPolicy,
    target?: OperationTarget,
  ): Promise<void> {
    if (
      findWorkspaceAuthContextEntry()?.authorizedOperationNames.has(
        policy.name,
      ) !== true
    ) {
      await this.authorizeOrThrow(policy);
    }

    if (!isDefined(target)) {
      return;
    }

    const entry = findWorkspaceAuthContextEntry();
    const targetReceipt = `${policy.name}:${target.metadataName}:${target.id}`;

    if (
      !isDefined(entry) ||
      entry.authorizedOperationNames.has(targetReceipt)
    ) {
      return;
    }

    await this.authorizeTargetOrThrow({
      target,
      workspaceId: entry.authContext.workspace.id,
    });

    entry.authorizedOperationNames.add(targetReceipt);
  }

  private async authorizeTargetOrThrow({
    target,
    workspaceId,
  }: {
    target: OperationTarget;
    workspaceId: string;
  }): Promise<void> {
    const flatMapsKey = getMetadataFlatEntityMapsKey(target.metadataName);
    const flatEntityMapsByKey =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: [flatMapsKey] },
      );
    const flatEntity = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: target.id,
      flatEntityMaps: flatEntityMapsByKey[
        flatMapsKey
      ] as unknown as FlatEntityMaps<SyncableFlatEntity>,
    });

    // An unknown id is left to the operation, which answers it as missing
    if (!isDefined(flatEntity)) {
      return;
    }

    const isReachable = await this.applicationReachService.canReachApplication({
      workspaceId,
      metadataName: target.metadataName,
      applicationId: flatEntity.applicationId,
      access: target.access,
    });

    if (!isReachable) {
      throw target.createOutOfReachException(target.id);
    }
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
