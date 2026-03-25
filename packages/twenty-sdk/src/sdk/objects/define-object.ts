import { type DefineEntity } from '@/sdk/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/common/utils/create-validation-result';
import { validateFields } from '@/sdk/fields/validate-fields';
import { type ObjectConfig } from '@/sdk/objects/object-config';
import { isDefined } from 'twenty-shared/utils';

export const defineObject: DefineEntity<ObjectConfig> = (config) => {
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

  if (
    isDefined(config.labelIdentifierFieldMetadataUniversalIdentifier) &&
    !config.fields.some(
      (field) =>
        field.universalIdentifier ===
        config.labelIdentifierFieldMetadataUniversalIdentifier,
    )
  ) {
    errors.push(
      'labelIdentifierFieldMetadataUniversalIdentifier must reference a field defined in the fields array',
    );
  }

  return createValidationResult({
    config,
    errors,
  });
};
