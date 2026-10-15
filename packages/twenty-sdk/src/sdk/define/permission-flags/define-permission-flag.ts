import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type TranslatablePermissionFlagConfig } from '@/sdk/define/permission-flags/permission-flag-config';

export const definePermissionFlag: DefineEntity<
  TranslatablePermissionFlagConfig
> = (config) => {
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

  return createValidationResult({ config, errors });
};
