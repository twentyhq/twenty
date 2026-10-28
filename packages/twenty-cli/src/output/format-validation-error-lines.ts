import { isDefined } from 'twenty-shared/utils';

import { type ValidationErrorDetail } from '@/output/types/validation-error-detail.type';

export const formatValidationErrorLines = (
  details: ValidationErrorDetail[],
): string =>
  details
    .map(
      ({ metadataName, entity, message }) =>
        `• ${metadataName}${isDefined(entity) ? ` ${entity}` : ''}: ${message}`,
    )
    .join('\n');
