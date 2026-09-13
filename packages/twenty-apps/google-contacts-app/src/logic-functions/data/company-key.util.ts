import { isNonEmptyString } from '@sniptt/guards';

import { readHostname } from 'src/logic-functions/data/link-domain.util';
import { type Organization } from 'src/logic-functions/types/google-response.type';

export const readCompanyDomain = (
  rawDomain: string | null | undefined,
): string | undefined => {
  if (!isNonEmptyString(rawDomain)) {
    return undefined;
  }

  const hostname = readHostname(rawDomain.trim());

  return isNonEmptyString(hostname)
    ? hostname.replace(/^www\./, '')
    : undefined;
};

export const readCompanyName = (
  rawName: string | null | undefined,
): string | undefined => {
  const name = rawName?.trim();

  return isNonEmptyString(name) ? name : undefined;
};

export const buildCompanyKey = (
  organization: Organization | undefined,
): string | undefined => {
  const domain = readCompanyDomain(organization?.domain);

  if (isNonEmptyString(domain)) {
    return `domain:${domain}`;
  }

  const name = readCompanyName(organization?.name);

  return isNonEmptyString(name) ? `name:${name.toLowerCase()}` : undefined;
};
