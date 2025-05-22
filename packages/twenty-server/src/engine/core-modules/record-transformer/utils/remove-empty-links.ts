import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isValidUrl } from 'twenty-shared/utils';

import { LinkMetadataNullable } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';

export const removeEmptyLinks = ({
  primaryLinkUrl,
  secondaryLinks,
  primaryLinkLabel,
}: {
  secondaryLinks: LinkMetadataNullable[] | null;
  primaryLinkUrl: string | null;
  primaryLinkLabel: string | null;
}) => {
  const filteredLinks = [
    isNonEmptyString(primaryLinkUrl)
      ? {
          url: primaryLinkUrl,
          label: primaryLinkLabel,
        }
      : null,
    ...(secondaryLinks ?? []),
  ]
    .filter(isDefined)
    .map((link) => {
      if (!isNonEmptyString(link.url)) {
        return undefined;
      }

      return {
        url: link.url,
        label: link.label,
      };
    })
    .filter(isDefined);

  for (const link of filteredLinks) {
    if (!isValidUrl(link.url)) {
      throw new Error('Invalid URL');
    }
  }

  const firstLink = filteredLinks.at(0);
  const otherLinks = filteredLinks.slice(1);

  return {
    primaryLinkUrl: firstLink?.url ?? null,
    primaryLinkLabel: firstLink?.label ?? null,
    secondaryLinks: otherLinks,
  };
};
