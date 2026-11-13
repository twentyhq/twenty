import { isNonEmptyString } from '@sniptt/guards';
import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';

type ParsedRecordLimitInput =
  | { isValid: true; recordLimit: number | null }
  | { isValid: false };

export const parseRecordLimitInput = (
  recordLimitInput: string,
): ParsedRecordLimitInput => {
  const trimmedRecordLimitInput = recordLimitInput.trim();

  if (!isNonEmptyString(trimmedRecordLimitInput)) {
    return { isValid: true, recordLimit: null };
  }

  const recordLimit = Number(trimmedRecordLimitInput);

  if (
    !Number.isInteger(recordLimit) ||
    recordLimit < 1 ||
    recordLimit > QUERY_MAX_RECORDS_FROM_RELATION
  ) {
    return { isValid: false };
  }

  return { isValid: true, recordLimit };
};
