import { isNonEmptyString } from '@sniptt/guards';
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

// Full composite writes (all three subfields present, or empty object used as
// clear) still run removeEmptyLinks so invalid/empty links are consolidated.
// Partial writes only transform the provided keys so omitted subfields are not
// null-written over stored values.
export const transformLinksValue = (
  value: LinksFieldGraphQLInput,
): LinksFieldGraphQLInput => {
  if (!isDefined(value)) {
    return value;
  }

  const hasPrimaryLinkUrl = 'primaryLinkUrl' in value;
  const hasPrimaryLinkLabel = 'primaryLinkLabel' in value;
  const hasSecondaryLinks = 'secondaryLinks' in value;
  const isFullCompositeWrite =
    (hasPrimaryLinkUrl && hasPrimaryLinkLabel && hasSecondaryLinks) ||
    (!hasPrimaryLinkUrl && !hasPrimaryLinkLabel && !hasSecondaryLinks);

  if (isFullCompositeWrite) {
    const primaryLinkUrlRaw = (value.primaryLinkUrl ?? null) as string | null;
    const primaryLinkLabelRaw = (value.primaryLinkLabel ??
      null) as string | null;
    const secondaryLinksRaw = (value.secondaryLinks ?? null) as string | null;

    const secondaryLinksArray = isNonEmptyString(secondaryLinksRaw)
      ? parseJson<LinkMetadataNullable[]>(secondaryLinksRaw)
      : secondaryLinksRaw;

    const { primaryLinkLabel, primaryLinkUrl, secondaryLinks } =
      removeEmptyLinks({
        primaryLinkUrl: primaryLinkUrlRaw,
        primaryLinkLabel: primaryLinkLabelRaw,
        secondaryLinks: secondaryLinksArray,
      });

    const processedSecondaryLinks = secondaryLinks?.map((link) => ({
      ...link,
      url: isDefined(link.url) ? normalizeUrlOrigin(link.url) : link.url,
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
  }

  const result: LinksFieldGraphQLInput = {};

  if (hasPrimaryLinkUrl) {
    result.primaryLinkUrl = isNonEmptyString(value.primaryLinkUrl)
      ? normalizeUrlOrigin(value.primaryLinkUrl)
      : value.primaryLinkUrl;
  }

  if (hasPrimaryLinkLabel) {
    result.primaryLinkLabel = value.primaryLinkLabel;
  }

  if (hasSecondaryLinks) {
    const secondaryLinksRaw = value.secondaryLinks;

    if (!isDefined(secondaryLinksRaw) || secondaryLinksRaw === null) {
      result.secondaryLinks = null;
    } else {
      const secondaryLinksArray = isNonEmptyString(secondaryLinksRaw)
        ? parseJson<LinkMetadataNullable[]>(secondaryLinksRaw)
        : (secondaryLinksRaw as unknown as LinkMetadataNullable[]);

      const processedSecondaryLinks = (secondaryLinksArray ?? [])
        .filter((link) => isDefined(link) && isNonEmptyString(link.url))
        .map((link) => ({
          ...link,
          url: isDefined(link.url) ? normalizeUrlOrigin(link.url) : link.url,
        }));

      result.secondaryLinks = isEmpty(processedSecondaryLinks)
        ? null
        : JSON.stringify(processedSecondaryLinks);
    }
  }

  return result;
};
