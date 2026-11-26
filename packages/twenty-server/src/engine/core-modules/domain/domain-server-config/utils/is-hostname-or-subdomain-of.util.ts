import { isNonEmptyString } from '@sniptt/guards';

const normalizeHostname = (hostname: string) =>
  hostname.trim().toLowerCase().replace(/\.$/, '');

export const isHostnameOrSubdomainOf = ({
  hostname,
  domains,
}: {
  hostname: string;
  domains: (string | undefined)[];
}): boolean => {
  const normalizedHostname = normalizeHostname(hostname);

  return domains
    .filter(isNonEmptyString)
    .map(normalizeHostname)
    .some(
      (domain) =>
        normalizedHostname === domain ||
        normalizedHostname.endsWith(`.${domain}`),
    );
};
