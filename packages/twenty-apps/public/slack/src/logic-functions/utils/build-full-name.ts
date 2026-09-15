import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';

export const buildFullName = (nameValue: unknown): string | undefined => {
  const name = asRecord(nameValue);
  const fullName = [
    readOptionalString(name?.firstName),
    readOptionalString(name?.lastName),
  ]
    .filter(isDefined)
    .join(' ');

  return isNonEmptyString(fullName) ? fullName : undefined;
};
