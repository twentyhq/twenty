import type { DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type FrontComponentConfig } from '@/sdk/define/front-component/front-component-config';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const defineFrontComponent: DefineEntity<FrontComponentConfig> = (
  config,
) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Front component must have a universalIdentifier');
  }

  if (!config.component) {
    errors.push('Front component must have a component');
  }

  if (typeof config.component !== 'function') {
    errors.push('Front component component must be a React component');
  }

  const widgetAvailability = config.widgetAvailability;

  if (
    isDefined(widgetAvailability) &&
    'objectUniversalIdentifiers' in widgetAvailability &&
    isDefined(widgetAvailability.objectUniversalIdentifiers) &&
    !isNonEmptyArray(widgetAvailability.objectUniversalIdentifiers)
  ) {
    errors.push(
      'Front component widgetAvailability.objectUniversalIdentifiers must not be empty: omit it to offer the component on every record page, or omit widgetAvailability to offer it nowhere',
    );
  }

  return createValidationResult({
    config,
    errors,
  });
};
