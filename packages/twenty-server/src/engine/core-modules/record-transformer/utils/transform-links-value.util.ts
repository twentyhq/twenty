import { isNonEmptyString } from '@sniptt/guards';
import {
  isDefined,
  lowercaseUrlAndRemoveTrailingSlash,
} from 'twenty-shared/utils';

import { removeEmptyLinks } from 'src/engine/core-modules/record-transformer/utils/remove-empty-links';
import { LinkMetadataNullable } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';

export type LinksFieldGraphQLInput =
  | {
      primaryLinkUrl?: string | null;
      primaryLinkLabel?: string | null;
      secondaryLinks?: string | null;
    }
  | null
  | undefined;

export const transformLinksValue = (
  value: LinksFieldGraphQLInput,
): LinksFieldGraphQLInput => {
  if (!value) {
    return value;
  }

  const primaryLinkUrlRaw = value.primaryLinkUrl as string | null;
  const primaryLinkLabelRaw = value.primaryLinkLabel as string | null;
  const secondaryLinksRaw = value.secondaryLinks as string | null;

  let secondaryLinksArray: LinkMetadataNullable[] | null = null;

  if (isNonEmptyString(secondaryLinksRaw)) {
    try {
      secondaryLinksArray = JSON.parse(secondaryLinksRaw);
    } catch {
      /* empty */
    }
  }

  const { primaryLinkLabel, primaryLinkUrl, secondaryLinks } = removeEmptyLinks(
    {
      primaryLinkUrl: primaryLinkUrlRaw,
      primaryLinkLabel: primaryLinkLabelRaw,
      secondaryLinks: secondaryLinksArray,
    },
  );

  return {
    ...value,
    primaryLinkUrl: isDefined(primaryLinkUrl)
      ? lowercaseUrlAndRemoveTrailingSlash(primaryLinkUrl)
      : primaryLinkUrl,
    primaryLinkLabel,
    secondaryLinks: JSON.stringify(
      secondaryLinks?.map((link) => ({
        ...link,
        url: isDefined(link.url)
          ? lowercaseUrlAndRemoveTrailingSlash(link.url)
          : link.url,
      })),
    ),
  };
};
