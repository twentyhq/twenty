import { type CompanyDomainNameRewrite } from 'src/database/commands/upgrade-version-command/2-38/utils/compute-company-domain-name-rewrites.util';
import { type DomainNameLinks } from 'src/database/commands/upgrade-version-command/2-38/utils/normalize-domain-name-links.util';

export const partitionCompanyDomainNameRewrites = ({
  rewrites,
  claimedPrimaryLinkUrls,
}: {
  rewrites: CompanyDomainNameRewrite[];
  claimedPrimaryLinkUrls: Set<string>;
}): {
  updates: { id: string; domainName: DomainNameLinks }[];
  skippedCompanyIds: string[];
} => {
  const updates: { id: string; domainName: DomainNameLinks }[] = [];
  const skippedCompanyIds: string[] = [];

  for (const { id, currentPrimaryLinkUrl, domainName } of rewrites) {
    const isPrimaryLinkUrlRewritten =
      domainName.primaryLinkUrl !== currentPrimaryLinkUrl;

    if (isPrimaryLinkUrlRewritten) {
      if (claimedPrimaryLinkUrls.has(domainName.primaryLinkUrl)) {
        skippedCompanyIds.push(id);
        continue;
      }

      claimedPrimaryLinkUrls.add(domainName.primaryLinkUrl);
    }

    updates.push({ id, domainName });
  }

  return { updates, skippedCompanyIds };
};
