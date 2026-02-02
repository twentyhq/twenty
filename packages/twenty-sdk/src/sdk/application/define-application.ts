import { type ApplicationManifest } from 'twenty-shared/application';
import { createValidationResult } from '@/sdk/common/utils/create-validation-result';
import { type DefineEntity } from '@/sdk/common/types/define-entity.type';

export const defineApplication: DefineEntity<ApplicationManifest> = (
  config,
) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Application must have a universalIdentifier');
  }

  if (!config.defaultRoleUniversalIdentifier) {
    errors.push('Application must have a defaultRoleUniversalIdentifier');
  }

  return createValidationResult({
    config,
    errors,
  });
};
