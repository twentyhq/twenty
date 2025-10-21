import { isDefined } from 'twenty-shared/utils';

import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';
import { isWorkEmail } from 'src/utils/is-work-email';

export const getSubdomainFromEmail = (email?: string) => {
  if (!isDefined(email) || !isWorkEmail(email)) return;

  const domain = getDomainNameByEmail(email);

  return domain.split('.')[0].toLowerCase();
};
