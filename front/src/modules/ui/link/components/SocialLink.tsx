import * as React from 'react';
import styled from '@emotion/styled';

import { RoundedLink } from './RoundedLink';

export enum LinkType {
  Url = 'url',
  LinkedIn = 'linkedin',
  Twitter = 'twitter',
}

type OwnProps = {
  href: string;
  children?: React.ReactNode;
  type?: LinkType;
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

export function SocialLink({ children, href, onClick, type }: OwnProps) {
  let displayValue = children;

  if (type === 'linkedin') {
    const splitUrl = href.split('/');
    const splitName = splitUrl[4].split('-');
    displayValue = splitName[2]
      ? `${splitName[0]}-${splitName[1]}`
      : splitName[0];
  }

  if (type === 'twitter') {
    const splitUrl = href.split('/');
    displayValue = `@${splitUrl[3]}`;
  }

  return (
    <StyledRawLink href={href} onClick={onClick}>
      {displayValue}
    </StyledRawLink>
  );
}
