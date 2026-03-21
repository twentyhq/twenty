import { isValidTwentySubdomain } from 'twenty-shared/utils';

import { RESERVED_SUBDOMAINS } from 'src/engine/core-modules/workspace/constants/reserved-subdomains.constant';

export const isSubdomainValid = (subdomain: string) => {
  return (
    isValidTwentySubdomain(subdomain) &&
    !RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())
  );
};
