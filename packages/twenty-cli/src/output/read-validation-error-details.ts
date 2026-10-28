import { isArray, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ValidationErrorDetail } from '@/output/types/validation-error-detail.type';

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
