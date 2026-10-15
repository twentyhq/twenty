import { AsyncLocalStorage } from 'async_hooks';

import { isDefined } from 'twenty-shared/utils';

import {
  type UnattestedPrincipal,
  type WorkspaceAuthContextEntry,
} from 'src/engine/core-modules/auth/types/workspace-auth-context-entry.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildSystemAuthContext } from 'src/engine/core-modules/auth/utils/build-system-auth-context.util';
import { getWorkspaceAuthContextIdentity } from 'src/engine/core-modules/auth/utils/get-workspace-auth-context-identity.util';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { type AuthPrincipalVariant } from 'src/engine/guards/types/auth-principal-variant.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { intersectRolePermissionConfigs } from 'src/engine/twenty-orm/utils/intersect-role-permission-configs.util';

const workspaceAuthContextStorage =
  new AsyncLocalStorage<WorkspaceAuthContextEntry>();

const UNATTESTED_PRINCIPAL: UnattestedPrincipal = { kind: 'unattested' };

export const getWorkspaceAuthContext = (): WorkspaceAuthContext => {
  const entry = workspaceAuthContextStorage.getStore();

  if (!entry) {
    throw new Error(
      'Workspace auth context not set. Operations must be wrapped with withWorkspaceAuthContext()',
    );
  }

  return entry.authContext;
};

export const findWorkspaceAuthContext = (): WorkspaceAuthContext | undefined =>
  workspaceAuthContextStorage.getStore()?.authContext;

// For the authorization module only: everything else reads the auth context alone
export const findWorkspaceAuthContextEntry = ():
  | WorkspaceAuthContextEntry
  | undefined => workspaceAuthContextStorage.getStore();

export const getWorkspaceAuthContextEntryOrThrow =
  (): WorkspaceAuthContextEntry => {
    const entry = workspaceAuthContextStorage.getStore();

    if (!entry) {
      throw new Error('Workspace auth context entry not set');
    }

    return entry;
  };

const openEntry = <T>(
  {
    authContext,
    principal,
    rolePermissionConfig,
  }: {
    authContext: WorkspaceAuthContext;
    principal?: WorkspaceAuthContextEntry['principal'];
    rolePermissionConfig?: RolePermissionConfig;
  },
  callback: () => T | Promise<T>,
): T | Promise<T> => {
  const outerEntry = workspaceAuthContextStorage.getStore();
  const isSameIdentity =
    isDefined(outerEntry) &&
    getWorkspaceAuthContextIdentity(outerEntry.authContext) ===
      getWorkspaceAuthContextIdentity(authContext);

  const entry: WorkspaceAuthContextEntry = isSameIdentity
    ? {
        authContext,
        principal: principal ?? outerEntry.principal,
        rolePermissionConfig: intersectRolePermissionConfigs(
          outerEntry.rolePermissionConfig,
          rolePermissionConfig,
        ),
        ...(outerEntry.isRefusedByOuterNarrowing === true && {
          isRefusedByOuterNarrowing: true,
        }),
        authorizedOperationNames: new Set(),
      }
    : {
        authContext,
        principal: principal ?? UNATTESTED_PRINCIPAL,
        rolePermissionConfig,
        ...((isDefined(outerEntry?.rolePermissionConfig) ||
          outerEntry?.isRefusedByOuterNarrowing === true) && {
          isRefusedByOuterNarrowing: true,
        }),
        authorizedOperationNames: new Set(),
      };

  return workspaceAuthContextStorage.run(entry, callback);
};

// Starts a flow: whoever opens it vouches for its principal
export const startWorkspaceAuthContext = <T>(
  {
    authContext,
    principal,
    rolePermissionConfig,
  }: {
    authContext: WorkspaceAuthContext;
    principal: AuthPrincipalVariant | UnattestedPrincipal;
    rolePermissionConfig?: RolePermissionConfig;
  },
  callback: () => T | Promise<T>,
): T | Promise<T> =>
  openEntry({ authContext, principal, rolePermissionConfig }, callback);

// Re-wraps within a flow: the principal is only inherited, by the same identity
export const withWorkspaceAuthContext = <T>(
  authContext: WorkspaceAuthContext,
  callback: () => T | Promise<T>,
  options?: { rolePermissionConfig?: RolePermissionConfig },
): T | Promise<T> =>
  openEntry(
    { authContext, rolePermissionConfig: options?.rolePermissionConfig },
    callback,
  );

// The only way to act as the platform itself, which no outer narrowing applies to
export const withSystemAuthorizationScope = <T>(
  { workspaceId, reason }: { workspaceId: string; reason: string },
  callback: () => T | Promise<T>,
): T | Promise<T> =>
  workspaceAuthContextStorage.run(
    {
      authContext: buildSystemAuthContext({
        workspace: { id: workspaceId } as FlatWorkspace,
      }),
      principal: { kind: 'system', reason },
      authorizedOperationNames: new Set(),
    },
    callback,
  );
