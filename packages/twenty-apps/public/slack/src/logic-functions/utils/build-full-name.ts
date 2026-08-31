import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { asNonEmptyString } from 'src/logic-functions/utils/as-non-empty-string';
import { asObject } from 'src/logic-functions/utils/as-object';

export const buildFullName = (nameValue: unknown): string | undefined => {
  const name = asObject(nameValue);
  const fullName = [
    asNonEmptyString(name?.firstName),
    asNonEmptyString(name?.lastName),
  ]
    .filter(isDefined)
    .join(' ');

  return isNonEmptyString(fullName) ? fullName : undefined;
};
