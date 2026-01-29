import { isNonEmptyArray } from 'twenty-shared/utils';
import { applicationEntityBuilder } from './entities/application';
import {
  type EntityIdWithLocation,
  type ManifestWithoutSources,
} from '@/cli/utilities/build/manifest/entities/entity-interface';
import { frontComponentEntityBuilder } from './entities/front-component';
import { logicFunctionEntityBuilder } from '@/cli/utilities/build/manifest/entities/logic-function';
import { objectEntityBuilder } from './entities/object';
import { objectExtensionEntityBuilder } from './entities/object-extension';
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
    ...objectExtensionEntityBuilder.findDuplicates(manifest),
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
  objectEntityBuilder.validate(manifest.entities.objects, errors);
  objectExtensionEntityBuilder.validate(
    manifest.entities.objectExtensions,
    errors,
  );
  logicFunctionEntityBuilder.validate(manifest.entities.logicFunctions, errors);
  roleEntityBuilder.validate(manifest.entities.roles, errors);
  frontComponentEntityBuilder.validate(
    manifest.entities.frontComponents,
    errors,
  );

  const duplicates = collectAllDuplicates(manifest);
  for (const dup of duplicates) {
    errors.push({
      path: dup.locations.join(', '),
      message: `Duplicate universalIdentifier: ${dup.id}`,
    });
  }

  if (!isNonEmptyArray(manifest.entities.objects)) {
    warnings.push({
      message: 'No objects defined',
    });
  }

  if (!isNonEmptyArray(manifest.entities.logicFunctions)) {
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
