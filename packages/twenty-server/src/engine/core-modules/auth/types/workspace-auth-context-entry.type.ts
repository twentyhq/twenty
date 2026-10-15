import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type AuthPrincipalVariant } from 'src/engine/guards/types/auth-principal-variant.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

export type OperationPrincipal =
  | AuthPrincipalVariant
  | { kind: 'system'; reason: string };

// nothing vouched for the channel: normal code runs, protected operations are refused
export type UnattestedPrincipal = { kind: 'unattested' };

export type WorkspaceAuthContextEntry = {
  authContext: WorkspaceAuthContext;
  principal: OperationPrincipal | UnattestedPrincipal;
  rolePermissionConfig?: RolePermissionConfig;
  // set when an outer entry of another identity was narrowed, which this entry cannot carry over
  isRefusedByOuterNarrowing?: true;
  authorizedOperationNames: Set<string>;
};
