import * as React from 'react';
import styled from '@emotion/styled';

import { getDisplayValueByUrlType } from '~/utils/getDisplayValueByUrlType';

import { RoundedLink } from './RoundedLink';

export enum LinkType {
  Url = 'url',
  LinkedIn = 'linkedin',
  Twitter = 'twitter',
}

type SocialLinkProps = {
  href: string;
  children?: React.ReactNode;
  type: LinkType;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

const StyledRawLink = styled(RoundedLink)`
  overflow: hidden;

  a {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const SocialLink = ({
  children,
  href,
  onClick,
  type,
}: SocialLinkProps) => {
  const displayValue =
    getDisplayValueByUrlType({ type: type, href: href }) ?? children;

  return (
    <StyledRawLink href={href} onClick={onClick}>
      {displayValue}
    </StyledRawLink>
  );
};
