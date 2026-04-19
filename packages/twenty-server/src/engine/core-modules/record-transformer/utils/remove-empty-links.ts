import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isValidUrl } from 'twenty-shared/utils';
import { type LinkMetadataNullable } from 'twenty-shared/types';

import {
  RecordTransformerException,
  RecordTransformerExceptionCode,
} from 'src/engine/core-modules/record-transformer/record-transformer.exception';

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
          Url: primaryLinkUrl,
          label: primaryLinkLabel,
        }
      : null,
    ...(secondaryLinks ?? []),
  ]
    .filter(isDefined)
    .map((link) => {
      if (!isNonEmptyString(link.Url)) {
        return undefined;
      }

      return {
        Url: link.Url,
        label: link.label,
      };
    })
    .filter(isDefined);

  for (const link of filteredLinks) {
    if (!isValidUrl(link.Url)) {
      throw new RecordTransformerException(
        'The Url of the link is not valid',
        RecordTransformerExceptionCode.INVALID_URL,
      );
    }
  }

  const firstLink = filteredLinks[0];
  const otherLinks = filteredLinks.slice(1);

  return {
    primaryLinkUrl: firstLink?.Url ?? null,
    primaryLinkLabel: firstLink?.label ?? null,
    secondaryLinks: otherLinks,
  };
};
