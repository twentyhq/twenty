import { MouseEvent } from 'react';
import styled from '@emotion/styled';

import { RoundedLink } from '@/ui/link/components/RoundedLink';

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

export function InplaceInputURLDisplayMode({ value }: OwnProps) {
  let type = 'url';
  function handleClick(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }
  const absoluteUrl = value
    ? value.startsWith('http')
      ? value
      : 'https://' + value
    : '';
  if (
    /^(http|https):\/\/(?:www\.)?linkedin.com(\w+:{0,1}\w*@)?(\S+)(:([0-9])+)?(\/|\/([\w#!:.?+=&%@!\-/]))?$/.test(
      absoluteUrl,
    )
  ) {
    type = 'linkedin';
  }
  if (
    absoluteUrl.match(
      /^((http|https):\/\/)?(?:www\.)?twitter\.com\/(\w+)?$/i,
    ) ||
    absoluteUrl.match(/^@?(\w+)$/)
  ) {
    type = 'twitter';
  }

  return (
    <StyledRawLink href={absoluteUrl} onClick={handleClick} type={type}>
      {value}
    </StyledRawLink>
  );
}
