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
