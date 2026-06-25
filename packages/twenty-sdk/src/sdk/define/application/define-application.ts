import { FieldMetadataType } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type ApplicationConfig } from '@/sdk/define/application/application-config';
import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';

export const defineApplication: DefineEntity<ApplicationConfig> = (config) => {
  const errors = [];
  const warnings = [];

  if (!config.universalIdentifier) {
    errors.push('Application must have a universalIdentifier');
  }

  if (!config.displayName || config.displayName.length === 0) {
    errors.push('Application must have a non empty display name');
  }

  // SELECT / MULTI_SELECT variables are useless without choices; enforce it
  // here since the shared type keeps `options` optional for storage reasons.
  for (const [variableName, variable] of Object.entries(
    config.applicationVariables ?? {},
  )) {
    const requiresOptions =
      variable.type === FieldMetadataType.SELECT ||
      variable.type === FieldMetadataType.MULTI_SELECT;

    if (requiresOptions && !isNonEmptyArray(variable.options)) {
      errors.push(
        `Application variable "${variableName}" of type ${variable.type} must define non-empty options`,
      );
    }
  }

  if (config.defaultRoleUniversalIdentifier) {
    warnings.push(
      '`defaultRoleUniversalIdentifier` on defineApplication() is deprecated. Use defineApplicationRole() in your role file instead.',
    );
  }

  return createValidationResult({
    config,
    errors,
    warnings,
  });
};
