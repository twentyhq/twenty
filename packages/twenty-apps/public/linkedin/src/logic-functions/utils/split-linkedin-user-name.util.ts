import { isNonEmptyString } from '@sniptt/guards';

import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

export const splitLinkedinUserName = (
  user: Pick<UnipileUser, 'display_name' | 'first_name' | 'last_name'>,
): { firstName: string; lastName: string } => {
  if (isNonEmptyString(user.first_name) || isNonEmptyString(user.last_name)) {
    return {
      firstName: user.first_name?.trim() ?? '',
      lastName: user.last_name?.trim() ?? '',
    };
  }

  const [firstName = '', ...lastNameParts] = (user.display_name ?? '')
    .trim()
    .split(/\s+/);

  return { firstName, lastName: lastNameParts.join(' ') };
};
