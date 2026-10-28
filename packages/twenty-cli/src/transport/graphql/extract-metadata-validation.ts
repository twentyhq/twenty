import { isArray, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ValidationErrorDetail } from '@/output/validation-errors';

const MAX_VALIDATION_ERRORS = 100;

const ENTITY_LABEL_KEYS = [
  'nameSingular',
  'namePlural',
  'name',
  'label',
  'universalIdentifier',
  'id',
] as const;

const readEntityLabel = (entity: unknown): string | undefined => {
  if (!isPlainObject(entity)) {
    return undefined;
  }

  for (const key of ENTITY_LABEL_KEYS) {
    const value = entity[key];

    if (isString(value) && value.length > 0) {
      return value;
    }
  }

  return undefined;
};

const extractFromExtensions = (
  extensions: Record<string, unknown>,
): ValidationErrorDetail[] => {
  if (!isPlainObject(extensions.errors)) {
    return [];
  }

  const details: ValidationErrorDetail[] = [];

  for (const [metadataName, failures] of Object.entries(extensions.errors)) {
    if (!isArray(failures)) {
      continue;
    }

    for (const failure of failures) {
      if (!isPlainObject(failure) || !isArray(failure.errors)) {
        continue;
      }

      const entity = readEntityLabel(failure.flatEntityMinimalInformation);

      for (const error of failure.errors) {
        if (!isPlainObject(error) || !isString(error.message)) {
          continue;
        }

        details.push({
          metadataName,
          ...(isDefined(entity) ? { entity } : {}),
          message: error.message,
        });
      }
    }
  }

  return details;
};

// Metadata validation errors travel in the GraphQL error extensions (a generic
// summary plus a per-entity breakdown); the top-level message is generic. Pull
// the breakdown out so commands can surface it instead of dropping it.
export const extractMetadataValidation = (
  graphqlErrors: unknown[],
): { summary?: string; errors: ValidationErrorDetail[] } => {
  const errors: ValidationErrorDetail[] = [];
  let summary: string | undefined;

  for (const graphqlError of graphqlErrors) {
    if (
      !isPlainObject(graphqlError) ||
      !isPlainObject(graphqlError.extensions)
    ) {
      continue;
    }

    const extracted = extractFromExtensions(graphqlError.extensions);

    if (extracted.length === 0) {
      continue;
    }

    if (!isDefined(summary) && isString(graphqlError.extensions.message)) {
      summary = graphqlError.extensions.message;
    }

    errors.push(...extracted);
  }

  return {
    ...(isDefined(summary) ? { summary } : {}),
    errors: errors.slice(0, MAX_VALIDATION_ERRORS),
  };
};
