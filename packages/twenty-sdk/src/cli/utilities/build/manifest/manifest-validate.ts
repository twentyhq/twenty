import { type Manifest } from 'twenty-shared/application';
import { isNonEmptyArray } from 'twenty-shared/utils';

const extractDuplicates = (values: string[]): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    } else {
      seen.add(value);
    }
  }

  return Array.from(duplicates);
};

const findUniversalIdentifiers = (obj: object): string[] => {
  const universalIdentifiers: string[] = [];

  if (!obj) {
    return [];
  }

  for (const [key, val] of Object.entries(obj)) {
    if (key === 'universalIdentifier' && typeof val === 'string') {
      universalIdentifiers.push(val);
    }
    if (typeof val === 'object') {
      universalIdentifiers.push(...findUniversalIdentifiers(val));
    }
  }

  return universalIdentifiers;
};
export const manifestValidate = (manifest: Manifest) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const duplicates = extractDuplicates(findUniversalIdentifiers(manifest));

  if (duplicates.length > 0) {
    errors.push(`Duplicate universal identifiers: ${duplicates.join(', ')}`);
  }

  if (!isNonEmptyArray(manifest.objects)) {
    warnings.push('No object defined');
  }

  if (!isNonEmptyArray(manifest.logicFunctions)) {
    warnings.push('No logic function defined');
  }

  if (!isNonEmptyArray(manifest.frontComponents)) {
    warnings.push('No front component defined');
  }

  return { errors, warnings, isValid: errors.length === 0 };
};
