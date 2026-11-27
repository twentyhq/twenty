import { isDefined, isWorkEmail } from 'twenty-shared/utils';

import { getDomainFromEmailOrThrow } from 'src/utils/get-domain-from-email-or-throw';

export const getSubdomainFromEmail = (email?: string) => {
  if (!isDefined(email) || !isWorkEmail(email)) {
    return;
  }

  const domain = getDomainFromEmailOrThrow(email);

  return domain.split('.')[0].toLowerCase();
};
