import { createValidationResult } from '@/sdk/common/utils/create-validation-result';
import { type RoleManifest } from 'twenty-shared/application';
import { type DefineEntity } from '@/sdk/common/types/define-entity.type';

export const defineRole: DefineEntity<RoleManifest> = (config) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Role must have a universalIdentifier');
  }

  if (!config.label) {
    errors.push('Role must have a label');
  }

  if (config.objectPermissions) {
    for (const permission of config.objectPermissions) {
      if (!permission.objectUniversalIdentifier) {
        errors.push('Object permission must have an objectUniversalIdentifier');
      }
    }
  }

  if (config.fieldPermissions) {
    for (const permission of config.fieldPermissions) {
      if (!permission.objectUniversalIdentifier) {
        errors.push('Field permission must have an objectUniversalIdentifier');
      }

      if (!permission.fieldUniversalIdentifier) {
        errors.push('Field permission must have a fieldUniversalIdentifier');
      }
    }
  }

  return createValidationResult({ config, errors });
};
