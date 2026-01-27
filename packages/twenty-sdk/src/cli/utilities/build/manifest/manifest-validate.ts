import {
  type EntityIdWithLocation,
  type ManifestWithoutSources,
} from '@/cli/utilities/build/manifest/entities/entity-interface';
import {
  type ValidationError,
  type ValidationResult,
  type ValidationWarning,
} from '@/cli/utilities/build/manifest/manifest-types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { applicationEntityBuilder } from './entities/application';
import { frontComponentEntityBuilder } from './entities/front-component';
import { functionEntityBuilder } from './entities/function';
import { objectEntityBuilder } from './entities/object';
import { objectExtensionEntityBuilder } from './entities/object-extension';
import { roleEntityBuilder } from './entities/role';

const collectAllDuplicates = (
  manifest: ManifestWithoutSources,
): EntityIdWithLocation[] => {
  return [
    ...applicationEntityBuilder.findDuplicates(manifest),
    ...objectEntityBuilder.findDuplicates(manifest),
    ...objectExtensionEntityBuilder.findDuplicates(manifest),
    ...functionEntityBuilder.findDuplicates(manifest),
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
  objectExtensionEntityBuilder.validate(
    manifest.objectExtensions ?? [],
    errors,
  );
  functionEntityBuilder.validate(manifest.functions, errors);
  roleEntityBuilder.validate(manifest.roles ?? [], errors);
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

  if (!isNonEmptyArray(manifest.functions)) {
    warnings.push({
      message: 'No functions defined',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
