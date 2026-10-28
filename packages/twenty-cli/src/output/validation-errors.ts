import { isArray, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

export type ValidationErrorDetail = {
  metadataName: string;
  entity?: string;
  message: string;
};

export const readValidationErrorDetails = (
  details: Record<string, unknown> | undefined,
): ValidationErrorDetail[] => {
  if (!isDefined(details) || !isArray(details.validationErrors)) {
    return [];
  }

  return details.validationErrors.filter(
    (detail): detail is ValidationErrorDetail =>
      isPlainObject(detail) &&
      isString(detail.metadataName) &&
      isString(detail.message),
  );
};

export const formatValidationErrorLines = (
  details: ValidationErrorDetail[],
): string =>
  details
    .map(
      ({ metadataName, entity, message }) =>
        `• ${metadataName}${isDefined(entity) ? ` ${entity}` : ''}: ${message}`,
    )
    .join('\n');
