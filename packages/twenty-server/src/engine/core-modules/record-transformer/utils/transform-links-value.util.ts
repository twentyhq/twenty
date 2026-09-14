import { isNonEmptyString, isUndefined } from '@sniptt/guards';
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

import {
  removeEmptyAndValidateLinks,
  removeEmptyLinks,
} from 'src/engine/core-modules/record-transformer/utils/remove-empty-links';

export type LinksFieldGraphQLInput =
  | {
      primaryLinkUrl?: string | null;
      primaryLinkLabel?: string | null;
      secondaryLinks?: string | null;
    }
  | null
  | undefined;

type LinkUrlNormalizer = (url: string) => string;

const parseSecondaryLinks = (
  secondaryLinks: string | LinkMetadataNullable[] | null | undefined,
): LinkMetadataNullable[] | null =>
  isNonEmptyString(secondaryLinks)
    ? parseJson<LinkMetadataNullable[]>(secondaryLinks)
    : ((secondaryLinks as LinkMetadataNullable[] | null | undefined) ?? null);

const serializeSecondaryLinks = (
  secondaryLinks: LinkMetadataNullable[],
  normalizeLinkUrl: LinkUrlNormalizer,
): string | null => {
  const normalizedSecondaryLinks = secondaryLinks.map((link) => ({
    ...link,
    url: isDefined(link.url) ? normalizeLinkUrl(link.url) : link.url,
  }));

  return isEmpty(normalizedSecondaryLinks)
    ? null
    : JSON.stringify(normalizedSecondaryLinks);
};

// Rewriting the whole field is what lets an empty primary link be back-filled
// from the secondary ones: the caller told us about every link there is.
const transformWholeLinksValue = ({
  input,
  normalizeLinkUrl,
}: {
  input: NonNullable<LinksFieldGraphQLInput>;
  normalizeLinkUrl: LinkUrlNormalizer;
}): LinksFieldGraphQLInput => {
  const { primaryLinkUrl, primaryLinkLabel, secondaryLinks } = removeEmptyLinks(
    {
      primaryLinkUrl: input.primaryLinkUrl ?? null,
      primaryLinkLabel: input.primaryLinkLabel ?? null,
      secondaryLinks: parseSecondaryLinks(input.secondaryLinks),
    },
  );

  return {
    primaryLinkUrl: isDefined(primaryLinkUrl)
      ? normalizeLinkUrl(primaryLinkUrl)
      : primaryLinkUrl,
    primaryLinkLabel,
    secondaryLinks: serializeSecondaryLinks(secondaryLinks, normalizeLinkUrl),
  };
};

// A subfield the caller left out keeps whatever the row already holds, so this
// branch only emits the subfields it was given. Back-filling the primary link
// from the secondary ones is off the table here: the links it would draw from
// are the stored ones, which this input does not describe.
const transformPartialLinksValue = ({
  input,
  normalizeLinkUrl,
}: {
  input: NonNullable<LinksFieldGraphQLInput>;
  normalizeLinkUrl: LinkUrlNormalizer;
}): LinksFieldGraphQLInput => {
  const transformedValue: NonNullable<LinksFieldGraphQLInput> = {};

  if (!isUndefined(input.primaryLinkLabel)) {
    transformedValue.primaryLinkLabel = input.primaryLinkLabel;
  }

  if (!isUndefined(input.primaryLinkUrl)) {
    const [primaryLink] = removeEmptyAndValidateLinks([
      { url: input.primaryLinkUrl, label: null },
    ]);

    transformedValue.primaryLinkUrl = isDefined(primaryLink)
      ? normalizeLinkUrl(primaryLink.url)
      : null;

    // A label on its own is not a link, so clearing the url clears it too.
    if (!isDefined(primaryLink)) {
      transformedValue.primaryLinkLabel = null;
    }
  }

  if (!isUndefined(input.secondaryLinks)) {
    transformedValue.secondaryLinks = serializeSecondaryLinks(
      removeEmptyAndValidateLinks(
        parseSecondaryLinks(input.secondaryLinks) ?? [],
      ),
      normalizeLinkUrl,
    );
  }

  return transformedValue;
};

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

  const isWholeFieldWrite =
    !isUndefined(input.primaryLinkUrl) &&
    !isUndefined(input.primaryLinkLabel) &&
    !isUndefined(input.secondaryLinks);

  return isWholeFieldWrite
    ? transformWholeLinksValue({ input, normalizeLinkUrl })
    : transformPartialLinksValue({ input, normalizeLinkUrl });
};
