import { useLingui } from '@lingui/react/macro';
import React, { useMemo } from 'react';

import { getFieldLinkDefinedLinks } from '@/object-record/record-field/ui/meta-types/input/utils/getFieldLinkDefinedLinks';
import { type FieldLinksValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { SocialLink } from '@/ui/field/display/components/SocialLink/SocialLink';
import { OverflowingList } from 'twenty-ui/components/layout';
import {
  getAbsoluteUrlOrThrow,
  getUrlHostnameOrThrow,
  isDefined,
} from 'twenty-shared/utils';
import { RoundedLink } from '@/ui/navigation/link/components/RoundedLink/RoundedLink';
import { checkUrlType } from '~/utils/checkUrlType';
import { isSocialLinkType } from '~/utils/isSocialLinkType';

type LinksDisplayProps = {
  value?: FieldLinksValue;
  onLinkClick?: (url: string, event: React.MouseEvent<HTMLElement>) => void;
};

export const LinksDisplay = ({ value, onLinkClick }: LinksDisplayProps) => {
  const { t } = useLingui();

  const links = useMemo(() => {
    if (!isDefined(value)) {
      return [];
    }

    return getFieldLinkDefinedLinks(value).map(({ url, label }) => {
      let absoluteUrl = '';
      let hostname = '';
      try {
        absoluteUrl = getAbsoluteUrlOrThrow(url);
        hostname = getUrlHostnameOrThrow(absoluteUrl);
      } catch {
        absoluteUrl = '';
        hostname = '';
      }
      return {
        url: absoluteUrl,
        label,
        displayLabel: label || hostname,
        type: checkUrlType(absoluteUrl),
      };
    });
  }, [value]);

  return (
    <OverflowingList overflowLabel={t`Show all items`}>
      {links.map(({ url, label, displayLabel, type }, index) =>
        isSocialLinkType(type) ? (
          <SocialLink
            key={index}
            href={url}
            type={type}
            label={label}
            onClick={(event) => onLinkClick?.(url, event)}
          />
        ) : (
          <RoundedLink
            key={index}
            href={url}
            label={displayLabel}
            onClick={(event) => onLinkClick?.(url, event)}
          />
        ),
      )}
    </OverflowingList>
  );
};
