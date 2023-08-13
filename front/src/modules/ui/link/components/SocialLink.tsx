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
    const matches = href.match(
      /(?:https?:\/\/)?(?:www.)?linkedin.com\/(?:in|company)\/([-a-zA-Z0-9@:%_+.~#?&//=]*)/,
    );
    if (matches && matches[1]) {
      displayValue = matches[1];
    } else {
      displayValue = 'LinkedIn';
    }
  }

  if (type === 'twitter') {
    const matches = href.match(
      /(?:https?:\/\/)?(?:www.)?twitter.com\/([-a-zA-Z0-9@:%_+.~#?&//=]*)/,
    );
    if (matches && matches[1]) {
      displayValue = `@${matches[1]}`;
    } else {
      displayValue = '@twitter';
    }
  }

  return (
    <StyledRawLink href={href} onClick={onClick}>
      {displayValue}
    </StyledRawLink>
  );
}
