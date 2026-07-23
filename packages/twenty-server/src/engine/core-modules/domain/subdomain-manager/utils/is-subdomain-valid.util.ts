import { RESERVED_SUBDOMAINS } from 'twenty-shared/constants';
import { isValidTwentySubdomain } from 'twenty-shared/utils';

const DEFAULT_SUBDOMAIN_MIN_LENGTH = 3;

export const isSubdomainValid = (
  subdomain: string,
  minLength: number = DEFAULT_SUBDOMAIN_MIN_LENGTH,
) => {
  return (
    subdomain.length >= minLength &&
    isValidTwentySubdomain(subdomain) &&
    !RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())
  );
};
