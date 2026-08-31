import { isDefined } from 'twenty-sdk/utils';

import { asNonEmptyString } from 'src/logic-functions/utils/as-non-empty-string';

export const toEpochSeconds = (value: unknown): number | undefined => {
  const text = asNonEmptyString(value);

  if (!isDefined(text)) {
    return undefined;
  }

  const milliseconds = Date.parse(text);

  return Number.isNaN(milliseconds)
    ? undefined
    : Math.floor(milliseconds / 1000);
};
