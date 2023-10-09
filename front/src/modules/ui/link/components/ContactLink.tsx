import * as React from 'react';
import { Link as ReactLink } from 'react-router-dom';
import styled from '@emotion/styled';

type ContactLinkProps = {
  className?: string;
  href: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

const StyledClickable = styled.div`
  display: flex;
  overflow: hidden;
  white-space: nowrap;

  a {
    color: inherit;
    text-decoration: underline;
    text-decoration-color: ${({ theme }) => theme.border.color.strong};

    &:hover {
      text-decoration-color: ${({ theme }) => theme.font.color.primary};
    }
  }
`;

export const ContactLink = ({
  className,
  href,
  children,
  onClick,
}: ContactLinkProps) => (
  <div>
    <StyledClickable className={className}>
      <ReactLink target="_blank" onClick={onClick} to={href}>
        {children}
      </ReactLink>
    </StyledClickable>
  </div>
);
