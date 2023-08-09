import { MouseEvent } from 'react';
import styled from '@emotion/styled';

import { RoundedLink } from '@/ui/link/components/RoundedLink';
import { LinkType, SocialLink } from '@/ui/link/components/SocialLink';

const StyledRawLink = styled(RoundedLink)`
  overflow: hidden;

  a {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

type OwnProps = {
  value: string;
};

const checkUrlType = (url: string) => {
  if (
    /^(http|https):\/\/(?:www\.)?linkedin.com(\w+:{0,1}\w*@)?(\S+)(:([0-9])+)?(\/|\/([\w#!:.?+=&%@!\-/]))?$/.test(
      url,
    )
  ) {
    return LinkType.LinkedIn;
  }
  if (url.match(/^((http|https):\/\/)?(?:www\.)?twitter\.com\/(\w+)?$/i)) {
    return LinkType.Twitter;
  }

  return LinkType.Url;
};

export function InplaceInputURLDisplayMode({ value }: OwnProps) {
  function handleClick(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }
  const absoluteUrl = value
    ? value.startsWith('http')
      ? value
      : 'https://' + value
    : '';

  const type = checkUrlType(absoluteUrl);

  if (type === LinkType.LinkedIn || type === LinkType.Twitter) {
    return (
      <SocialLink href={absoluteUrl} onClick={handleClick} type={type}>
        {value}
      </SocialLink>
    );
  }
  return (
    <StyledRawLink href={absoluteUrl} onClick={handleClick}>
      {value}
    </StyledRawLink>
  );
}
