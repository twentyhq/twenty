import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { getFieldDefaultValueWarnings } from '@/sdk/define/fields/get-field-default-value-warnings';
import { validateFields } from '@/sdk/define/fields/validate-fields';
import { isEngineDerivedLabelIdentifier } from '@/sdk/define/objects/is-engine-derived-label-identifier';
import { type ObjectConfig } from '@/sdk/define/objects/object-config';
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

  const labelIdentifiesAnEngineDerivedField = isEngineDerivedLabelIdentifier({
    fields: config.fields,
    labelIdentifierFieldMetadataUniversalIdentifier:
      config.labelIdentifierFieldMetadataUniversalIdentifier,
  });

  const warnings = [
    ...getFieldDefaultValueWarnings(config.fields),
    ...(labelIdentifiesAnEngineDerivedField
      ? [
          `labelIdentifierFieldMetadataUniversalIdentifier of "${config.nameSingular}" names no field in its fields array; it must name a field the engine derives for this object, or the sync will fail to resolve it`,
        ]
      : []),
  ];

  return createValidationResult({
    config,
    errors,
    warnings,
  });
};
