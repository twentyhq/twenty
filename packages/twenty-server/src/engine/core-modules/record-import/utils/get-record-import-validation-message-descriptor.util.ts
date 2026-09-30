import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { RATING_VALUES } from 'twenty-shared/constants';
import {
  assertUnreachable,
  type SpreadsheetImportValidationMessage,
} from 'twenty-shared/utils';

// Server counterpart of the browser's message texts, rendered in the
// requester's locale by the job.
export const getRecordImportValidationMessageDescriptor = ({
  code,
  fieldName,
}: SpreadsheetImportValidationMessage): MessageDescriptor => {
  switch (code) {
    case 'NOT_A_NUMBER':
      return msg`${fieldName} must be a number`;
    case 'INVALID_UUID':
      return msg`${fieldName} is not a valid UUID`;
    case 'INVALID_EMAIL':
      return msg`${fieldName} is not a valid email`;
    case 'INVALID_EMAIL_ARRAY':
      return msg`${fieldName} must be an array of valid emails`;
    case 'INVALID_URL':
      return msg`${fieldName} is not a valid URL`;
    case 'INVALID_LINK_ARRAY':
      return msg`${fieldName} must be an array of objects with a valid url and label`;
    case 'INVALID_DATE_TIME':
      return msg`${fieldName} is not a valid date time (format: '2021-12-01T00:00:00Z')`;
    case 'INVALID_DATE':
      return msg`${fieldName} is not a valid date (format: '2021-12-01')`;
    case 'INVALID_PHONE_NUMBER':
      return msg`${fieldName} is not a valid phone number`;
    case 'INVALID_CALLING_CODE':
      return msg`${fieldName} is not a valid calling code`;
    case 'INVALID_COUNTRY_CODE':
      return msg`${fieldName} is not a valid country code`;
    case 'INVALID_PHONE_ARRAY':
      return msg`${fieldName} must be an array of objects with a valid number, calling code and country code`;
    case 'INVALID_JSON':
      return msg`${fieldName} is not a valid JSON`;
    case 'INVALID_ARRAY':
      return msg`${fieldName} is not a valid array`;
    case 'INVALID_RATING': {
      const ratingValues = RATING_VALUES.join(', ');

      return msg`${fieldName} must be one of ${ratingValues} values`;
    }
    case 'DUPLICATE_IN_IMPORT':
      return msg`This ${fieldName} value already exists in your import data`;
    default:
      return assertUnreachable(code);
  }
};
