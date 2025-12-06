import React, { useMemo } from 'react';

import { getFieldLinkDefinedLinks } from '@/object-record/record-field/ui/meta-types/input/utils/getFieldLinkDefinedLinks';
import { type FieldLinksValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { FieldClickAction } from 'twenty-shared/types';
import {
  getAbsoluteUrlOrThrow,
  getUrlHostnameOrThrow,
  isDefined,
} from 'twenty-shared/utils';
import { LinkType, RoundedLink, SocialLink } from 'twenty-ui/navigation';
import { checkUrlType } from '~/utils/checkUrlType';

type LinksDisplayProps = {
  value?: FieldLinksValue;
  onLinkClick?: (url: string, event: React.MouseEvent<HTMLElement>) => void;
  clickAction?: FieldClickAction;
};

export const LinksDisplay = ({
  value,
  onLinkClick,
  clickAction,
}: LinksDisplayProps) => {
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
        label: label || hostname,
        type: checkUrlType(absoluteUrl),
      };
    });
  }, [value]);

  const handleClick = (url: string, event: React.MouseEvent<HTMLElement>) => {
    if (clickAction === FieldClickAction.COPY) {
      onLinkClick?.(url, event);
    }
  };

  return (
    <ExpandableList>
      {links.map(({ url, label, type }, index) =>
        type === LinkType.LinkedIn || type === LinkType.Twitter ? (
          <SocialLink
            key={index}
            href={url}
            type={type}
            label={label}
            onClick={(event) => handleClick(url, event)}
          />
        ) : (
          <RoundedLink
            key={index}
            href={url}
            label={label}
            onClick={(event) => handleClick(url, event)}
          />
        ),
      )}
    </ExpandableList>
  );
};
