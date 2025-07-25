import { isNonEmptyString } from '@sniptt/guards';
import {
  isDefined,
  lowercaseUrlOriginAndRemoveTrailingSlash,
  parseJson,
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
  if (!isDefined(value)) {
    return value;
  }

  
  const safeValue = value as NonNullable<LinksFieldGraphQLInput>;

  // Handle each field individually without force casting
  const primaryLinkUrl = isDefined(safeValue.primaryLinkUrl) 
    ? lowercaseUrlOriginAndRemoveTrailingSlash(safeValue.primaryLinkUrl)
    : safeValue.primaryLinkUrl;

  const primaryLinkLabel = safeValue.primaryLinkLabel ?? null;

  // Handle secondaryLinks only if provided
  let secondaryLinksArray: LinkMetadataNullable[] | null = null;
  if (isDefined(safeValue.secondaryLinks)) {
    if (isNonEmptyString(safeValue.secondaryLinks)) {
      try {
        secondaryLinksArray = parseJson<LinkMetadataNullable[]>(safeValue.secondaryLinks);
        
        if (secondaryLinksArray) {
          secondaryLinksArray = secondaryLinksArray
            .map((link: LinkMetadataNullable) => {
              if (!isDefined(link)) return link;
              
              return {
                url: isDefined(link.url)
                  ? lowercaseUrlOriginAndRemoveTrailingSlash(link.url)
                  : link.url,
                label: link.label,
              };
            })
            .filter(isDefined);
        }
      } catch {
        secondaryLinksArray = null;
      }
    }
  }

  // Apply removeEmptyLinks logic to handle fallback behavior
  const processedLinks = removeEmptyLinks({
    primaryLinkUrl,
    primaryLinkLabel,
    secondaryLinks: secondaryLinksArray,
  });

  return {
    primaryLinkUrl: processedLinks.primaryLinkUrl,
    primaryLinkLabel: processedLinks.primaryLinkLabel,
    secondaryLinks: JSON.stringify(processedLinks.secondaryLinks),
  };
};
