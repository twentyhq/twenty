import { MouseEvent } from 'react';
import styled from '@emotion/styled';

import { RoundedLink } from '@/ui/navigation/link/components/RoundedLink';
import {
  LinkType,
  SocialLink,
} from '@/ui/navigation/link/components/SocialLink';
import { FieldURLV2Value } from '@/ui/object/field/types/FieldMetadata';

import { EllipsisDisplay } from './EllipsisDisplay';

const StyledRawLink = styled(RoundedLink)`
  overflow: hidden;

  a {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

type URLV2DisplayProps = {
  value?: FieldURLV2Value;
};

const checkUrlType = (url: string) => {
  if (
    /^(http|https):\/\/(?:www\.)?linkedin.com(\w+:{0,1}\w*@)?(\S+)(:([0-9])+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(
      url,
    )
  ) {
    return LinkType.LinkedIn;
  }
  if (url.match(/^((http|https):\/\/)?(?:www\.)?twitter\.com\/(\w+)?/i)) {
    return LinkType.Twitter;
  }

  return LinkType.Url;
};

export const URLV2Display = ({ value }: URLV2DisplayProps) => {
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const absoluteUrl = value?.link
    ? value.link.startsWith('http')
      ? value.link
      : 'https://' + value.link
    : '';

  const displayedValue = value?.text ?? '';

  const type = checkUrlType(absoluteUrl);

  if (type === LinkType.LinkedIn || type === LinkType.Twitter) {
    return (
      <EllipsisDisplay>
        <SocialLink href={absoluteUrl} onClick={handleClick} type={type}>
          {displayedValue}
        </SocialLink>
      </EllipsisDisplay>
    );
  }
  return (
    <EllipsisDisplay>
      <StyledRawLink href={absoluteUrl} onClick={handleClick}>
        {displayedValue}
      </StyledRawLink>
    </EllipsisDisplay>
  );
};
