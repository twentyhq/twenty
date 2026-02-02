import { type ObjectManifest } from 'twenty-shared/application';

import { createValidationResult } from '@/sdk/common/utils/create-validation-result';
import { type DefineEntity } from '@/sdk/common/types/define-entity.type';
import { validateFields } from '@/sdk/fields/validate-fields';

export const defineObject: DefineEntity<ObjectManifest> = (config) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Object must have a universalIdentifier');
  }

  if (!config.nameSingular) {
    errors.push('Object must have a nameSingular');
  }

  if (!config.namePlural) {
    errors.push('Object must have a namePlural');
  }

  if (!config.labelSingular) {
    errors.push('Object must have a labelSingular');
  }

  if (!config.labelPlural) {
    errors.push('Object must have a labelPlural');
  }

  const fieldErrors = validateFields(config.fields);

  errors.push(...fieldErrors);

  return createValidationResult({
    config,
    errors,
  });
};
