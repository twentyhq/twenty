import {
  type DomainNameLinks,
  normalizeDomainNameLinks,
} from 'src/database/commands/upgrade-version-command/2-38/utils/normalize-domain-name-links.util';

export type CompanyDomainNameRewrite = {
  id: string;
  currentPrimaryLinkUrl: string;
  domainName: DomainNameLinks;
};

export const computeCompanyDomainNameRewrites = (
  candidates: { id: string; domainName: DomainNameLinks }[],
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
