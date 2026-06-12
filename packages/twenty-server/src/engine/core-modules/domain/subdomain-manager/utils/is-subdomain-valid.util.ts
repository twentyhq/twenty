import { RESERVED_SUBDOMAINS } from 'twenty-shared/constants';
import { isValidTwentySubdomain } from 'twenty-shared/utils';

export const isSubdomainValid = (subdomain: string) => {
  return (
    isValidTwentySubdomain(subdomain) &&
    !RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())
  );
};
