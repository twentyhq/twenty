import { isNonEmptyString } from '@sniptt/guards';
import { isFieldValueRestricted } from 'twenty-shared/utils';

export const getAuthorizedLinkedRecordName = (
  recordIdentifierName: string | undefined,
): string | undefined =>
  isNonEmptyString(recordIdentifierName) &&
  !isFieldValueRestricted(recordIdentifierName)
    ? recordIdentifierName
    : undefined;
