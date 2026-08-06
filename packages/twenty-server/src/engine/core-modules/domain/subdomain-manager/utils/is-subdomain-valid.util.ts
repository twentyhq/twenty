import {
  DEFAULT_SUBDOMAIN_MIN_LENGTH,
  RESERVED_SUBDOMAINS,
} from 'twenty-shared/constants';
import { isValidTwentySubdomain } from 'twenty-shared/utils';

export const isSubdomainValid = ({
  subdomain,
  minLength = DEFAULT_SUBDOMAIN_MIN_LENGTH,
}: {
  subdomain: string;
  minLength?: number;
}) => {
  return (
    subdomain.length >= minLength &&
    isValidTwentySubdomain(subdomain) &&
    !RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())
  );
};
