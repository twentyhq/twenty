import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { lowercaseDomain } from 'src/engine/api/graphql/workspace-query-runner/utils/query-runner-links.util';
import { removeEmptyLinks } from 'src/engine/core-modules/record-transformer/utils/remove-empty-links';
import { LinkMetadataNullable } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transformLinksValue = (value: any): any => {
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
      ? lowercaseDomain(primaryLinkUrl)
      : primaryLinkUrl,
    primaryLinkLabel,
    secondaryLinks: JSON.stringify(
      secondaryLinks?.map((link) => ({
        ...link,
        url: isDefined(link.url) ? lowercaseDomain(link.url) : link.url,
      })),
    ),
  };
};
