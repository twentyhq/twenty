import * as React from 'react';
import { Link as ReactLink } from 'react-router-dom';
import styled from '@emotion/styled';

type OwnProps = {
  className?: string;
  href: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

const StyledClickable = styled.div<{ hrefIsEmpty: boolean }>`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border-color: ${({ theme }) => theme.border.color.medium};
  border-radius: 50px;
  border-style: solid;
  border-width: 1px;
  padding: ${({ hrefIsEmpty }) => (hrefIsEmpty ? '0px' : '3px 8px')};
  white-space: nowrap;

  a {
    color: inherit;
    font-size: ${({ theme }) => theme.font.size.md};
    text-decoration: none;
  }
`;

export function RawLink({ className, href, children, onClick }: OwnProps) {
  const hrefIsEmpty = href === '';

  return (
    <StyledClickable className={className} hrefIsEmpty={hrefIsEmpty}>
      <ReactLink target="_blank" onClick={onClick} to={href}>
        {children}
      </ReactLink>
    </StyledClickable>
  );
}
