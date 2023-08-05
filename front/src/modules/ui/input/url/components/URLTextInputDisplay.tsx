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
  function handleClick(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }

  const absoluteUrl = value
    ? value.startsWith('http')
      ? value
      : 'https://' + value
    : '';

  return (
    <StyledRawLink href={absoluteUrl} onClick={handleClick}>
      {value}
    </StyledRawLink>
  );
}
