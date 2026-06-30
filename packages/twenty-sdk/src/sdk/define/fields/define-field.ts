import { type FieldManifest } from 'twenty-shared/application';
import { getFieldDefaultValueWarnings } from '@/sdk/define/fields/get-field-default-value-warnings';
import { validateFields } from '@/sdk/define/fields/validate-fields';

import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';

export const defineField: DefineEntity<FieldManifest> = (config) => {
  const errors = [];

  if (!config.objectUniversalIdentifier) {
    errors.push('Field must have an objectUniversalIdentifier');
  }

  const fieldErrors = validateFields([config]);

  errors.push(...fieldErrors);

  const warnings = getFieldDefaultValueWarnings([config]);

  return createValidationResult({
    config,
    errors,
    warnings,
  });
};
