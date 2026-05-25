import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type PermissionFlagConfig } from '@/sdk/define/permission-flags/permission-flag-config';

const PERMISSION_TYPES = ['settings', 'tool'] as const;

export const definePermissionFlag: DefineEntity<PermissionFlagConfig> = (
  config,
) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('Permission flag must have a universalIdentifier');
  }

  if (!config.key) {
    errors.push('Permission flag must have a key');
  }

  if (!config.label) {
    errors.push('Permission flag must have a label');
  }

  if (!PERMISSION_TYPES.includes(config.permissionType)) {
    errors.push(
      `Permission flag permissionType must be one of: ${PERMISSION_TYPES.join(', ')}`,
    );
  }

  return createValidationResult({ config, errors });
};
