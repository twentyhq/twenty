import { isNonEmptyArray } from 'twenty-shared/utils';
import { applicationEntityBuilder } from './entities/application';
import {
  type EntityIdWithLocation,
  type ManifestWithoutSources,
} from '@/cli/utilities/build/manifest/entities/entity-interface';
import { frontComponentEntityBuilder } from './entities/front-component';
import { logicFunctionEntityBuilder } from '@/cli/utilities/build/manifest/entities/logic-function';
import { objectEntityBuilder } from './entities/object';
import { fieldEntityBuilder } from '@/cli/utilities/build/manifest/entities/field';
import { roleEntityBuilder } from './entities/role';
import {
  type ValidationError,
  type ValidationResult,
  type ValidationWarning,
} from '@/cli/utilities/build/manifest/manifest-types';

const collectAllDuplicates = (
  manifest: ManifestWithoutSources,
): EntityIdWithLocation[] => {
  return [
    ...applicationEntityBuilder.findDuplicates(manifest),
    ...objectEntityBuilder.findDuplicates(manifest),
    ...fieldEntityBuilder.findDuplicates(manifest),
    ...logicFunctionEntityBuilder.findDuplicates(manifest),
    ...roleEntityBuilder.findDuplicates(manifest),
    ...frontComponentEntityBuilder.findDuplicates(manifest),
  ];
};

export const validateManifest = (
  manifest: ManifestWithoutSources,
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  applicationEntityBuilder.validate([manifest.application], errors);
  objectEntityBuilder.validate(manifest.objects, errors);
  fieldEntityBuilder.validate(manifest.fields, errors);
  logicFunctionEntityBuilder.validate(manifest.logicFunctions, errors);
  roleEntityBuilder.validate(manifest.roles, errors);
  frontComponentEntityBuilder.validate(manifest.frontComponents, errors);

  const duplicates = collectAllDuplicates(manifest);
  for (const dup of duplicates) {
    errors.push({
      path: dup.locations.join(', '),
      message: `Duplicate universalIdentifier: ${dup.id}`,
    });
  }

  if (!isNonEmptyArray(manifest.objects)) {
    warnings.push({
      message: 'No objects defined',
    });
  }

  if (!isNonEmptyArray(manifest.logicFunctions)) {
    warnings.push({
      message: 'No logicFunctions defined',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
