import { isArray } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';
import {
  type LinksFieldGraphQLInput,
  transformLinksValue,
} from 'src/engine/core-modules/record-transformer/utils/transform-links-value.util';

const LINKS_SUBFIELD_KEYS = [
  'primaryLinkUrl',
  'primaryLinkLabel',
  'secondaryLinks',
] as const;

const EMPTY_LINKS_FIELD_VALUE: NonNullable<LinksFieldGraphQLInput> = {
  primaryLinkUrl: null,
  primaryLinkLabel: null,
  secondaryLinks: null,
};

const normalizeExistingLinksFieldValue = (
  existingLinksValue: unknown,
): NonNullable<LinksFieldGraphQLInput> => {
  if (!isDefined(existingLinksValue) || !isPlainObject(existingLinksValue)) {
    return EMPTY_LINKS_FIELD_VALUE;
  }

  const linksValue = existingLinksValue as Record<string, unknown>;
  const secondaryLinks = linksValue.secondaryLinks;

  return {
    primaryLinkUrl: (linksValue.primaryLinkUrl as string | null) ?? null,
    primaryLinkLabel: (linksValue.primaryLinkLabel as string | null) ?? null,
    secondaryLinks: isArray(secondaryLinks)
      ? JSON.stringify(secondaryLinks)
      : ((secondaryLinks as string | null) ?? null),
  };
};

const mergePartialLinksFieldUpdate = ({
  partialUpdate,
  existingValue,
}: {
  partialUpdate: NonNullable<LinksFieldGraphQLInput>;
  existingValue: NonNullable<LinksFieldGraphQLInput>;
}): NonNullable<LinksFieldGraphQLInput> => {
  return mergeUpdateInExistingRecord({
    existing: existingValue,
    update: partialUpdate,
    properties: [...LINKS_SUBFIELD_KEYS],
  });
};

export const processLinksFieldUpdate = (
  partialLinksValue: LinksFieldGraphQLInput,
  existingLinksValue: unknown,
): LinksFieldGraphQLInput => {
  if (!isDefined(partialLinksValue)) {
    return partialLinksValue;
  }

  if (Object.keys(partialLinksValue).length === 0) {
    return transformLinksValue(partialLinksValue);
  }

  const mergedLinksValue = mergePartialLinksFieldUpdate({
    partialUpdate: partialLinksValue,
    existingValue: normalizeExistingLinksFieldValue(existingLinksValue),
  });

  return transformLinksValue(mergedLinksValue);
};
