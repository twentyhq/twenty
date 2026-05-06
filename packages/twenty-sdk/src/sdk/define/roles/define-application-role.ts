import { defineRole } from '@/sdk/define/roles/define-role';
import { type RoleConfig } from '@/sdk/define/roles/role-config';
import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';

// `defineApplicationRole` declares the single role that the application's
// logic functions and runtime token will assume after install. The build
// pipeline detects it by name and wires its universalIdentifier into the
// application manifest's `defaultRoleUniversalIdentifier` automatically —
// mirroring how `definePreInstallLogicFunction` and
// `definePostInstallLogicFunction` are auto-detected.
//
// Validation is identical to `defineRole` so both helpers can be used
// interchangeably from a permissions standpoint.
export const defineApplicationRole: DefineEntity<RoleConfig> = (config) =>
  defineRole(config);
