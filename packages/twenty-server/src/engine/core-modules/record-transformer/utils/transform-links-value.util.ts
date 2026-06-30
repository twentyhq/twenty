import { isArray, isNonEmptyString } from '@sniptt/guards';
import isEmpty from 'lodash.isempty';
import { type LinkMetadataNullable } from 'twenty-shared/types';
import { isDefined, normalizeUrlOrigin, parseJson } from 'twenty-shared/utils';

import { removeEmptyLinks } from 'src/engine/core-modules/record-transformer/utils/remove-empty-links';

export type LinksFieldGraphQLInput =
  | {
      primaryLinkUrl?: string | null;
      primaryLinkLabel?: string | null;
      secondaryLinks?: string | null;
    }
  | null
  | undefined;

const parseSecondaryLinksArray = (
  secondaryLinksRaw: string | LinkMetadataNullable[] | null | undefined,
): LinkMetadataNullable[] | null => {
  if (!isDefined(secondaryLinksRaw)) {
    return null;
  }

  if (isArray(secondaryLinksRaw)) {
    return secondaryLinksRaw;
  }

  if (!isNonEmptyString(secondaryLinksRaw)) {
    return null;
  }

  return parseJson<LinkMetadataNullable[]>(secondaryLinksRaw);
};

export const transformLinksValue = (
  value: LinksFieldGraphQLInput,
): LinksFieldGraphQLInput => {
  if (!isDefined(value)) {
    return value;
  }

  if (Object.keys(value).length === 0) {
    return {
      primaryLinkLabel: null,
      primaryLinkUrl: null,
      secondaryLinks: null,
    };
  }

  const secondaryLinksArray = parseSecondaryLinksArray(value.secondaryLinks);

  const { primaryLinkLabel, primaryLinkUrl, secondaryLinks } = removeEmptyLinks(
    {
      primaryLinkUrl: value.primaryLinkUrl ?? null,
      primaryLinkLabel: value.primaryLinkLabel ?? null,
      secondaryLinks: secondaryLinksArray,
    },
  );

  const processedSecondaryLinks = secondaryLinks?.map((link) => ({
    url: isDefined(link.url) ? normalizeUrlOrigin(link.url) : link.url,
    label: link.label,
  }));

  return {
    primaryLinkUrl: isDefined(primaryLinkUrl)
      ? normalizeUrlOrigin(primaryLinkUrl)
      : primaryLinkUrl,
    primaryLinkLabel,
    secondaryLinks: isEmpty(processedSecondaryLinks)
      ? null
      : JSON.stringify(processedSecondaryLinks),
  };
};
