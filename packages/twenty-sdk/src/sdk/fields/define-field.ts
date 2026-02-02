import { type FieldManifest } from 'twenty-shared/application';
import { validateFields } from '@/sdk/fields/validate-fields';

import { type DefineEntity } from '@/sdk/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/common/utils/create-validation-result';

export const defineField: DefineEntity<FieldManifest> = (config) => {
  const errors = [];

  if (!config.objectUniversalIdentifier) {
    errors.push('Field must have an objectUniversalIdentifier');
  }

  const fieldErrors = validateFields([config]);

  errors.push(...fieldErrors);

  return createValidationResult({
    config,
    errors,
  });
};
