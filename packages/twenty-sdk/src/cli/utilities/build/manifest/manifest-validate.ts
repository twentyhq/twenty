import { type ApplicationManifest } from 'twenty-shared/application';
import { applicationEntityBuilder } from './entities/application';
import { type DuplicateId } from './entities/entity.interface';
import { frontComponentEntityBuilder } from './entities/front-component';
import { functionEntityBuilder } from './entities/function';
import { objectEntityBuilder } from './entities/object';
import { objectExtensionEntityBuilder } from './entities/object-extension';
import { roleEntityBuilder } from './entities/role';
import {
  type ValidationError,
  type ValidationResult,
  type ValidationWarning,
} from './manifest.types';

const collectAllDuplicates = (
  manifest: Omit<ApplicationManifest, 'sources'>,
): DuplicateId[] => {
  return [
    ...applicationEntityBuilder.findDuplicates(manifest.application),
    ...objectEntityBuilder.findDuplicates(manifest.objects ?? []),
    ...objectExtensionEntityBuilder.findDuplicates(manifest.objectExtensions ?? []),
    ...functionEntityBuilder.findDuplicates(manifest.serverlessFunctions ?? []),
    ...roleEntityBuilder.findDuplicates(manifest.roles ?? []),
    ...frontComponentEntityBuilder.findDuplicates(manifest.frontComponents ?? []),
  ];
};

export const validateManifest = (
  manifest: Omit<ApplicationManifest, 'sources'>,
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  applicationEntityBuilder.validate(manifest.application, errors);
  objectEntityBuilder.validate(manifest.objects ?? [], errors);
  objectExtensionEntityBuilder.validate(manifest.objectExtensions ?? [], errors);
  functionEntityBuilder.validate(manifest.serverlessFunctions ?? [], errors);
  roleEntityBuilder.validate(manifest.roles ?? [], errors);
  frontComponentEntityBuilder.validate(manifest.frontComponents ?? [], errors);

  const duplicates = collectAllDuplicates(manifest);
  for (const dup of duplicates) {
    errors.push({
      path: dup.locations.join(', '),
      message: `Duplicate universalIdentifier: ${dup.id}`,
    });
  }

  if (!manifest.objects || manifest.objects.length === 0) {
    warnings.push({
      message: 'No objects defined in src/app/objects/',
    });
  }

  if (
    !manifest.serverlessFunctions ||
    manifest.serverlessFunctions.length === 0
  ) {
    warnings.push({
      message: 'No functions defined in src/app/functions/',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
