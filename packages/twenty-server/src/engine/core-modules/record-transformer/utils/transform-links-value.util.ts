import { isNonEmptyString } from '@sniptt/guards';
import isEmpty from 'lodash.isempty';
import {
  type FieldMetadataSettings,
  type FieldMetadataType,
  type LinkMetadataNullable,
} from 'twenty-shared/types';
import {
  isDefined,
  getLinkUrlNormalizer,
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
export const transformLinksValue = ({
  input,
  settings,
}: {
  input: LinksFieldGraphQLInput;
  settings?: FieldMetadataSettings<FieldMetadataType.LINKS>;
}): LinksFieldGraphQLInput => {
  if (!isDefined(input)) {
    return input;
  }

  const normalizeLinkUrl = getLinkUrlNormalizer(settings?.type);

  const primaryLinkUrlRaw = input.primaryLinkUrl as string | null;
  const primaryLinkLabelRaw = input.primaryLinkLabel as string | null;
  const secondaryLinksRaw = input.secondaryLinks as string | null;

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
    url: isDefined(link.url) ? normalizeLinkUrl(link.url) : link.url,
  }));

  return {
    ...input,
    primaryLinkUrl: isDefined(primaryLinkUrl)
      ? normalizeLinkUrl(primaryLinkUrl)
      : primaryLinkUrl,
    primaryLinkLabel,
    secondaryLinks: isEmpty(processedSecondaryLinks)
      ? null
      : JSON.stringify(processedSecondaryLinks),
  };
};
