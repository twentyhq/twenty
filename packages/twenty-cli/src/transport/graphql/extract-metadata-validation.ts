import { isArray, isNonEmptyString, isString } from '@sniptt/guards';
import { type FailedMetadataValidation } from 'twenty-shared/metadata';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ValidationErrorDetail } from '@/output/types/validation-error-detail.type';

const MAX_VALIDATION_ERRORS = 100;
const METADATA_VALIDATION_FAILED_CODE = 'METADATA_VALIDATION_FAILED';

const ENTITY_LABEL_KEYS = [
  'nameSingular',
  'namePlural',
  'name',
  'label',
  'universalIdentifier',
  'id',
] as const;

const readEntityLabel = (
  entityInformation: FailedMetadataValidation['flatEntityMinimalInformation'],
): string | undefined => {
  for (const key of ENTITY_LABEL_KEYS) {
    const value = entityInformation[key];

    if (isNonEmptyString(value)) {
      return value;
    }
  }

  return undefined;
};

const isFailedMetadataValidation = (
  value: unknown,
): value is FailedMetadataValidation =>
  isPlainObject(value) &&
  isArray(value.errors) &&
  isPlainObject(value.flatEntityMinimalInformation);

const collectDetails = ({
  errorsByMetadata,
  limit,
}: {
  errorsByMetadata: Record<string, unknown>;
  limit: number;
}): ValidationErrorDetail[] => {
  const details: ValidationErrorDetail[] = [];

  for (const [metadataName, failures] of Object.entries(errorsByMetadata)) {
    if (!isArray(failures)) {
      continue;
    }

    for (const failure of failures) {
      if (!isFailedMetadataValidation(failure)) {
        continue;
      }

      const entityLabel = readEntityLabel(failure.flatEntityMinimalInformation);

      for (const error of failure.errors) {
        if (!isPlainObject(error) || !isString(error.message)) {
          continue;
        }

        details.push({
          metadataName,
          ...(isDefined(entityLabel) ? { entityLabel } : {}),
          message: error.message,
        });

        if (details.length >= limit) {
          return details;
        }
      }
    }
  }

  return details;
};

export const extractMetadataValidation = (
  graphqlErrors: unknown[],
): { summary?: string; errors: ValidationErrorDetail[] } => {
  const errors: ValidationErrorDetail[] = [];
  let summary: string | undefined;

  for (const graphqlError of graphqlErrors) {
    if (
      !isPlainObject(graphqlError) ||
      !isPlainObject(graphqlError.extensions) ||
      graphqlError.extensions.code !== METADATA_VALIDATION_FAILED_CODE ||
      !isPlainObject(graphqlError.extensions.errors)
    ) {
      continue;
    }

    const extracted = collectDetails({
      errorsByMetadata: graphqlError.extensions.errors,
      limit: MAX_VALIDATION_ERRORS - errors.length,
    });

    if (extracted.length === 0) {
      continue;
    }

    if (!isDefined(summary) && isString(graphqlError.extensions.message)) {
      summary = graphqlError.extensions.message;
    }

    errors.push(...extracted);

    if (errors.length >= MAX_VALIDATION_ERRORS) {
      break;
    }
  }

  return {
    ...(isDefined(summary) ? { summary } : {}),
    errors,
  };
};
