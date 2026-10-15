import { type PermissionFlagType } from 'twenty-shared/constants';
import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ApplicationTargetAccess } from 'src/engine/core-modules/authorization/application-reach/types/application-target-access.type';
import { type AuthPrincipalGuardConfig } from 'src/engine/guards/types/auth-principal-guard-config.type';

export type OperationPolicy = {
  name: string;
  authPrincipal: AuthPrincipalGuardConfig;
  permissionFlags: readonly PermissionFlagType[];
  // Documents the targets the operation reaches; enforced by the services that read them, never by the evaluator
  targets?: readonly {
    metadataName: AllMetadataName;
    access: ApplicationTargetAccess;
  }[];
};
