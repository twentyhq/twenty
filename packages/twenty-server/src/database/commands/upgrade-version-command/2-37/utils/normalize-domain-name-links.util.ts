import { isNonEmptyString } from '@sniptt/guards';
import { type LinkMetadata, type LinksMetadata } from 'twenty-shared/types';
import { normalizeDomain } from 'twenty-shared/utils';

import { parseArrayOrJsonStringToArray } from 'src/engine/api/graphql/graphql-query-runner/utils/parse-additional-items.util';

const normalizeStoredDomain = (url: string): string =>
  isNonEmptyString(url) ? normalizeDomain(url) : url;

export type DomainNameLinks = Pick<
  LinksMetadata,
  'primaryLinkUrl' | 'secondaryLinks'
>;

export const normalizeDomainNameLinks = (
  domainName: DomainNameLinks,
): { changed: boolean; value: DomainNameLinks } => {
  const secondaryLinks = parseArrayOrJsonStringToArray<LinkMetadata>(
    domainName.secondaryLinks,
  );

  const normalizedPrimaryLinkUrl = normalizeStoredDomain(
    domainName.primaryLinkUrl,
  );

  const normalizedSecondaryLinks = secondaryLinks.map((link) => ({
    ...link,
    url: normalizeStoredDomain(link.url),
  }));

  const changed =
    normalizedPrimaryLinkUrl !== domainName.primaryLinkUrl ||
    normalizedSecondaryLinks.some(
      (link, index) => link.url !== secondaryLinks[index].url,
    );

  return {
    changed,
    value: {
      ...domainName,
      primaryLinkUrl: normalizedPrimaryLinkUrl,
      secondaryLinks:
        normalizedSecondaryLinks.length > 0
          ? normalizedSecondaryLinks
          : domainName.secondaryLinks,
    },
  };
};
