import { type Application } from 'twenty-shared/application';
import { createValidationResult } from '@/sdk/common/utils/create-validation-result';
import { type DefineEntity } from '@/sdk/common/types/define-entity.type';

export const defineApplication: DefineEntity<Application> = (config) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Application must have a universalIdentifier');
  }

  if (!config.roleUniversalIdentifier) {
    errors.push('Application must have a roleUniversalIdentifier');
  }

  return createValidationResult({
    config,
    errors,
  });
};
