import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const getAuthorizedLinkedRecordName = (
  recordIdentifier:
    | Pick<ObjectRecordIdentifier, 'name' | 'isNameRestricted'>
    | null
    | undefined,
): string | undefined =>
  isDefined(recordIdentifier) &&
  isNonEmptyString(recordIdentifier.name) &&
  !recordIdentifier.isNameRestricted
    ? recordIdentifier.name
    : undefined;
