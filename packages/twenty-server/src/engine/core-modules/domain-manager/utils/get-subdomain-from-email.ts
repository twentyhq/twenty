import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';
import { isWorkEmail } from 'src/utils/is-work-email';
import { isDefined } from 'twenty-shared';

export const getSubdomainFromEmail = (email?: string) => {
  if (!isDefined(email) || !isWorkEmail(email)) return;

  const domain = getDomainNameByEmail(email);

  return domain.split('.')[0];
};
