import { t } from '@lingui/core/macro';
import { RATING_VALUES } from 'twenty-shared/constants';
import {
  assertUnreachable,
  type SpreadsheetImportValidationMessage,
} from 'twenty-shared/utils';

export const getSpreadsheetImportValidationMessageText = ({
  code,
  fieldName,
}: SpreadsheetImportValidationMessage): string => {
  switch (code) {
    case 'NOT_A_NUMBER':
      return `${fieldName} ${t`must be a number`}`;
    case 'INVALID_UUID':
      return `${fieldName} ${t`is not a valid UUID`}`;
    case 'INVALID_EMAIL':
      return `${fieldName} ${t`is not a valid email`}`;
    case 'INVALID_EMAIL_ARRAY':
      return `${fieldName} ${t`must be an array of valid emails`}`;
    case 'INVALID_URL':
      return `${fieldName} ${t`is not a valid URL`}`;
    case 'INVALID_LINK_ARRAY':
      return `${fieldName} ${t`must be an array of object with valid url and label (format: '[{"url":"valid.url", "label":"label value")}]'`}`;
    case 'INVALID_DATE_TIME':
      return `${fieldName} ${t`is not a valid date time (format: '2021-12-01T00:00:00Z')`}`;
    case 'INVALID_DATE':
      return `${fieldName} ${t`is not a valid date (format: '2021-12-01')`}`;
    case 'INVALID_PHONE_NUMBER':
      return `${fieldName} ${t`is not a valid phone number`}`;
    case 'INVALID_CALLING_CODE':
      return `${fieldName} ${t`is not a valid calling code`}`;
    case 'INVALID_COUNTRY_CODE':
      return `${fieldName} ${t`is not a valid country code`}`;
    case 'INVALID_PHONE_ARRAY':
      return `${fieldName} ${t`must be an array of object with valid phone, calling code and country code (format: '[{"number":"123456789", "callingCode":"+33", "countryCode":"FR"}]')`}`;
    case 'INVALID_JSON':
      return `${fieldName} ${t`is not a valid JSON`}`;
    case 'INVALID_ARRAY':
      return `${fieldName} ${t`is not a valid array`}`;
    case 'INVALID_RATING': {
      const ratingValues = RATING_VALUES.join(', ');

      return `${fieldName} ${t` must be one of ${ratingValues} values`}`;
    }
    case 'DUPLICATE_IN_IMPORT':
      return t`This ${fieldName} value already exists in your import data`;
    default:
      return assertUnreachable(code);
  }
};
