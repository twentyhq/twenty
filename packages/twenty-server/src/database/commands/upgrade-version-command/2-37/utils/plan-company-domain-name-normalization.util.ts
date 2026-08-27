import { isNonEmptyString } from '@sniptt/guards';
import { type LinksMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { normalizeDomainNameLinks } from 'src/database/commands/upgrade-version-command/2-37/utils/normalize-domain-name-links.util';

type CompanyDomainName = { id: string; domainName: LinksMetadata | null };

export const planCompanyDomainNameNormalization = (
  companies: CompanyDomainName[],
): {
  updates: { id: string; domainName: LinksMetadata }[];
  skippedCompanyIds: string[];
} => {
  const primaryLinkUrlsInUse = new Set(
    companies
      .map((company) => company.domainName?.primaryLinkUrl)
      .filter(isNonEmptyString),
  );

  const updates: { id: string; domainName: LinksMetadata }[] = [];
  const skippedCompanyIds: string[] = [];

  for (const company of companies) {
    if (!isDefined(company.domainName)) {
      continue;
    }

    const { changed, value } = normalizeDomainNameLinks(company.domainName);

    if (!changed) {
      continue;
    }

    const currentPrimaryLinkUrl = company.domainName.primaryLinkUrl;
    const isPrimaryLinkUrlRewritten =
      value.primaryLinkUrl !== currentPrimaryLinkUrl;

    if (
      isPrimaryLinkUrlRewritten &&
      primaryLinkUrlsInUse.has(value.primaryLinkUrl)
    ) {
      skippedCompanyIds.push(company.id);
      continue;
    }

    if (isPrimaryLinkUrlRewritten) {
      primaryLinkUrlsInUse.delete(currentPrimaryLinkUrl);
      primaryLinkUrlsInUse.add(value.primaryLinkUrl);
    }

    updates.push({ id: company.id, domainName: value });
  }

  return { updates, skippedCompanyIds };
};
