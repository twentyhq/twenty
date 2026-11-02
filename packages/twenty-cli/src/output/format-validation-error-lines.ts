import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type ValidationErrorDetail } from '@/output/types/validation-error-detail.type';

export const formatValidationErrorLines = (
  details: ValidationErrorDetail[],
): string =>
  details
    .map(({ metadataName, entityLabel, message, userFriendlyMessage }) => {
      const description =
        isNonEmptyString(userFriendlyMessage) && userFriendlyMessage !== message
          ? `${userFriendlyMessage} (${message})`
          : message;

      return `• ${metadataName}${isDefined(entityLabel) ? ` ${entityLabel}` : ''}: ${description}`;
    })
    .join('\n');
