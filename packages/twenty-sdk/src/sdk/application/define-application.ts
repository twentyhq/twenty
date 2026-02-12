import { createValidationResult } from '@/sdk/common/utils/create-validation-result';
import { type DefineEntity } from '@/sdk/common/types/define-entity.type';
import { type ApplicationConfig } from '@/sdk/application/application-config';

export const defineApplication: DefineEntity<ApplicationConfig> = (config) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Application must have a universalIdentifier');
  }

  if (!config.defaultRoleUniversalIdentifier) {
    errors.push('Application must have a defaultRoleUniversalIdentifier');
  }

  if (!config.displayName || config.displayName.length === 0) {
    errors.push('Application must have a non empty display name');
  }

  return createValidationResult({
    config,
    errors,
  });
};
