import { isDefined } from 'twenty-shared/utils';

import { type ValidationErrorDetail } from '@/output/types/validation-error-detail.type';

export const formatValidationErrorLines = (
  details: ValidationErrorDetail[],
): string =>
  details
    .map(
      ({ metadataName, entityLabel, message }) =>
        `• ${metadataName}${isDefined(entityLabel) ? ` ${entityLabel}` : ''}: ${message}`,
    )
    .join('\n');
