import { isDefined } from 'twenty-shared/utils';

import { LinkMetadataNullable } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';

export const replaceEmptyPrimaryLink = ({
  primaryLinkUrl,
  secondaryLinks,
  primaryLinkLabel,
}: {
  secondaryLinks: LinkMetadataNullable[] | null;
  primaryLinkUrl: string | null | undefined;
  primaryLinkLabel: string | null | undefined;
}) => {
  const firstSecondaryLink = secondaryLinks?.at(0);

  if (isDefined(firstSecondaryLink) && !isDefined(primaryLinkUrl)) {
    primaryLinkUrl = firstSecondaryLink.url;
    primaryLinkLabel = firstSecondaryLink.label;

    if (isDefined(secondaryLinks)) {
      secondaryLinks = secondaryLinks.slice(1);
    }
  }

  return {
    primaryLinkUrl,
    primaryLinkLabel,
    secondaryLinks,
  };
};
