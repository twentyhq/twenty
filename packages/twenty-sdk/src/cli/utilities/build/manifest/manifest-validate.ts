import { type ApplicationManifest } from 'twenty-shared/application';
import { collectApplicationIds, validateApplication } from './entities/application';
import { collectFrontComponentIds, validateFrontComponents } from './entities/front-component';
import { collectFunctionIds, validateFunctions } from './entities/function';
import { collectObjectExtensionIds, validateObjectExtensions } from './entities/object-extension';
import { collectObjectIds, validateObjects } from './entities/object';
import { collectRoleIds, validateRoles } from './entities/role';
import {
  type ValidationError,
  type ValidationResult,
  type ValidationWarning,
} from './manifest.types';

const collectAllIds = (
  manifest: Omit<ApplicationManifest, 'sources'>,
): Array<{ id: string; location: string }> => {
  return [
    ...collectApplicationIds(manifest.application),
    ...collectObjectIds(manifest.objects ?? []),
    ...collectObjectExtensionIds(manifest.objectExtensions ?? []),
    ...collectFunctionIds(manifest.serverlessFunctions ?? []),
    ...collectRoleIds(manifest.roles ?? []),
    ...collectFrontComponentIds(manifest.frontComponents ?? []),
  ];
};

const findDuplicates = (
  ids: Array<{ id: string; location: string }>,
): Array<{ id: string; locations: string[] }> => {
  const seen = new Map<string, string[]>();

  for (const { id, location } of ids) {
    const locations = seen.get(id) ?? [];
    locations.push(location);
    seen.set(id, locations);
  }

  return Array.from(seen.entries())
    .filter(([_, locations]) => locations.length > 1)
    .map(([id, locations]) => ({ id, locations }));
};

export const validateManifest = (
  manifest: Omit<ApplicationManifest, 'sources'>,
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  validateApplication(manifest.application, errors);
  validateObjects(manifest.objects ?? [], errors);
  validateObjectExtensions(manifest.objectExtensions ?? [], errors);
  validateFunctions(manifest.serverlessFunctions ?? [], errors);
  validateRoles(manifest.roles ?? [], errors);
  validateFrontComponents(manifest.frontComponents ?? [], errors);

  const allIds = collectAllIds(manifest);
  const duplicates = findDuplicates(allIds);
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
