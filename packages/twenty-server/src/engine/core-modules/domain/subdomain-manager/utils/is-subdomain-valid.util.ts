import { RESERVED_SUBDOMAINS } from 'src/engine/core-modules/workspace/constants/reserved-subdomains.constant';
import { VALID_SUBDOMAIN_PATTERN } from 'src/engine/core-modules/workspace/constants/valid-subdomain-pattern.constant';

export const isSubdomainValid = (subdomain: string) => {
  return (
    VALID_SUBDOMAIN_PATTERN.test(subdomain) &&
    !RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())
  );
};
