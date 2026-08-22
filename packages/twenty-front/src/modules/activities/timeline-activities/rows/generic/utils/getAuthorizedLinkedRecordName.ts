import { isNonEmptyString } from '@sniptt/guards';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

export const getAuthorizedLinkedRecordName = (
  recordIdentifierName: string | undefined,
): string | undefined =>
  isNonEmptyString(recordIdentifierName) &&
  recordIdentifierName !== FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED
    ? recordIdentifierName
    : undefined;
