import { isNonEmptyArray } from '@sniptt/guards';

import { toText } from 'src/logic-functions/utils/to-text';
import { isDefined } from 'src/utils/is-defined';

export const buildPersonNameParam = ({
  firstName,
  lastName,
}: {
  firstName: unknown;
  lastName: unknown;
}): string | undefined => {
  const parts = [firstName, lastName]
    .map((part) => toText(part))
    .filter(isDefined);

  return isNonEmptyArray(parts) ? parts.join(' ') : undefined;
};
