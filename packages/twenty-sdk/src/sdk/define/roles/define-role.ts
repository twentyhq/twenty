import { SystemPermissionFlag } from 'twenty-shared/constants';

import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { type RoleConfig } from '@/sdk/define/roles/role-config';

export const defineRole: DefineEntity<RoleConfig> = (config) => {
  const errors = [];
  const warnings: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('Role must have a universalIdentifier');
  }

  if (!config.label) {
    errors.push('Role must have a label');
  }

  if (config.objectPermissions) {
    for (const permission of config.objectPermissions) {
      if (!permission.objectUniversalIdentifier) {
        errors.push('Object permission must have an objectUniversalIdentifier');
      }
    }
  }

  if (config.fieldPermissions) {
    for (const permission of config.fieldPermissions) {
      if (!permission.objectUniversalIdentifier) {
        errors.push('Field permission must have an objectUniversalIdentifier');
      }

      if (!permission.fieldUniversalIdentifier) {
        errors.push('Field permission must have a fieldUniversalIdentifier');
      }
    }
  }

  const legacyPermissionFlags = config.permissionFlags ?? [];
  const legacyAsUniversalIdentifiers = legacyPermissionFlags.map(
    (flag) => SystemPermissionFlag[flag],
  );

  if (legacyPermissionFlags.length > 0) {
    warnings.push(
      'Role config uses deprecated `permissionFlags`. Migrate to `permissionFlagUniversalIdentifiers` with `SystemPermissionFlag.*`.',
    );
  }

  const mergedUniversalIdentifiers = [
    ...new Set([
      ...(config.permissionFlagUniversalIdentifiers ?? []),
      ...legacyAsUniversalIdentifiers,
    ]),
  ];

  const normalizedConfig: RoleConfig = {
    ...config,
    permissionFlags: undefined,
    permissionFlagUniversalIdentifiers: mergedUniversalIdentifiers,
  };

  return createValidationResult({
    config: normalizedConfig,
    errors,
    warnings,
  });
};
