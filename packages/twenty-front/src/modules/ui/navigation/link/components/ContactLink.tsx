import * as React from 'react';
import { Theme, withTheme } from '@emotion/react';
import { styled } from '@linaria/react';

const StyledClickableLink = withTheme(styled.a<{
  theme: Theme;
  maxWidth?: number;
}>`
  color: inherit;
  overflow: hidden;
  text-decoration: underline;
  text-decoration-color: ${({ theme }) => theme.border.color.strong};
  text-overflow: ellipsis;

  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;

  max-width: ${({ maxWidth }) => maxWidth ?? '100%'};

  &:hover {
    text-decoration-color: ${({ theme }) => theme.font.color.primary};
  }
`);

type ContactLinkProps = {
  href: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  maxWidth?: number;
};

export const ContactLink = ({
  href,
  children,
  onClick,
  maxWidth,
}: ContactLinkProps) => (
  <StyledClickableLink
    maxWidth={maxWidth}
    target="_blank"
    onClick={onClick}
    href={href}
  >
    {children}
  </StyledClickableLink>
);
