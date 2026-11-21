import { isNonEmptyString } from '@sniptt/guards';

import { type PersonName } from 'src/logic-functions/types/person-name.type';

export const splitFullName = (fullName: string): PersonName | undefined => {
  const [firstName, ...lastNameParts] = fullName.trim().split(/\s+/);

  return !isNonEmptyString(firstName)
    ? undefined
    : { firstName, lastName: lastNameParts.join(' ') };
};
