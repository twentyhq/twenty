import { type LinksMetadata } from 'twenty-shared/types';

import { normalizeDomainNameLinks } from 'src/database/commands/upgrade-version-command/2-37/utils/normalize-domain-name-links.util';

export type CompanyDomainNameRewrite = {
  id: string;
  currentPrimaryLinkUrl: string;
  domainName: LinksMetadata;
};

export const computeCompanyDomainNameRewrites = (
  candidates: { id: string; domainName: LinksMetadata }[],
): CompanyDomainNameRewrite[] => {
  const rewrites: CompanyDomainNameRewrite[] = [];

  for (const { id, domainName } of candidates) {
    const { changed, value } = normalizeDomainNameLinks(domainName);

    if (changed) {
      rewrites.push({
        id,
        currentPrimaryLinkUrl: domainName.primaryLinkUrl,
        domainName: value,
      });
    }
  }

  return rewrites;
};
