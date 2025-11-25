import { isNonEmptyString } from '@sniptt/guards';
import isEmpty from 'lodash.isempty';
import { type LinkMetadataNullable } from 'twenty-shared/types';
import {
  isDefined,
  lowercaseUrlOriginAndRemoveTrailingSlash,
  parseJson,
} from 'twenty-shared/utils';

import { removeEmptyLinks } from 'src/engine/core-modules/record-transformer/utils/remove-empty-links';

export type LinksFieldGraphQLInput =
  | {
      primaryLinkUrl?: string | null;
      primaryLinkLabel?: string | null;
      secondaryLinks?: string | null;
    }
  | null
  | undefined;

// TODO refactor this function handle partial composite field update
export const transformLinksValue = (
  value: LinksFieldGraphQLInput,
): LinksFieldGraphQLInput => {
  if (!isDefined(value)) {
    return value;
  }

  const primaryLinkUrlRaw = value.primaryLinkUrl as string | null;
  const primaryLinkLabelRaw = value.primaryLinkLabel as string | null;
  const secondaryLinksRaw = value.secondaryLinks as string | null;

  const secondaryLinksArray = isNonEmptyString(secondaryLinksRaw)
    ? parseJson<LinkMetadataNullable[]>(secondaryLinksRaw)
    : secondaryLinksRaw;

  const { primaryLinkLabel, primaryLinkUrl, secondaryLinks } = removeEmptyLinks(
    {
      primaryLinkUrl: primaryLinkUrlRaw,
      primaryLinkLabel: primaryLinkLabelRaw,
      secondaryLinks: secondaryLinksArray,
    },
  );

  const processedSecondaryLinks = secondaryLinks?.map((link) => ({
    ...link,
    url: isDefined(link.url)
      ? lowercaseUrlOriginAndRemoveTrailingSlash(link.url)
      : link.url,
  }));

  return {
    ...value,
    primaryLinkUrl: isDefined(primaryLinkUrl)
      ? lowercaseUrlOriginAndRemoveTrailingSlash(primaryLinkUrl)
      : primaryLinkUrl,
    primaryLinkLabel,
    secondaryLinks: isEmpty(processedSecondaryLinks)
      ? null
      : JSON.stringify(processedSecondaryLinks),
  };
};
