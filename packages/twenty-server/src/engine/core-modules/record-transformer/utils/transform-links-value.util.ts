import { isNonEmptyString } from '@sniptt/guards';
import {
  isDefined,
  lowercaseUrlOriginAndRemoveTrailingSlash,
  parseJson,
} from 'twenty-shared/utils';

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
  if (!isDefined(value)) {
    return value;
  }

  
  const safeValue = value as NonNullable<LinksFieldGraphQLInput>;

  // Build result object only with fields that are actually provided
  const result: NonNullable<LinksFieldGraphQLInput> = {};

  // Handle primaryLinkUrl only if provided
  if (isDefined(safeValue.primaryLinkUrl)) {
    result.primaryLinkUrl = lowercaseUrlOriginAndRemoveTrailingSlash(safeValue.primaryLinkUrl);
  }

  if (isDefined(safeValue.primaryLinkLabel)) {
    result.primaryLinkLabel = safeValue.primaryLinkLabel;
  }

  // Handle secondaryLinks only if provided
  if (isDefined(safeValue.secondaryLinks)) {
    const secondaryLinksArray = isNonEmptyString(safeValue.secondaryLinks)
      ? parseJson<LinkMetadataNullable[]>(safeValue.secondaryLinks)
      : null;

    if (secondaryLinksArray) {
      const transformedSecondaryLinks = secondaryLinksArray
        .map((link: LinkMetadataNullable) => {
          if (!isDefined(link)) return link;
          
          return {
            ...link,
            url: isDefined(link.url)
              ? lowercaseUrlOriginAndRemoveTrailingSlash(link.url)
              : link.url,
          };
        })
        .filter(isDefined);

      result.secondaryLinks = JSON.stringify(transformedSecondaryLinks);
    } else {
      result.secondaryLinks = safeValue.secondaryLinks;
    }
  }

  return result;
};
