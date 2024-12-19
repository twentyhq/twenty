import { isDefined } from 'src/utils/is-defined';
import { isWorkEmail } from 'src/utils/is-work-email';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';

export const getSubdomainFromEmail = (email?: string) => {
  if (!isDefined(email) || !isWorkEmail(email)) return;

  return getDomainNameByEmail(email);
};
