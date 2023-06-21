import React from 'react';
import { Link as ReactLink } from 'react-router-dom';
import styled from '@emotion/styled';

type OwnProps = {
  children: React.ReactNode;
  href: string;
  onClick?: () => void;
  fullWidth?: boolean;
};

const StyledClickable = styled.div`
  display: flex;
  a {
    color: ${({ theme }) => theme.text40};
    font-size: ${({ theme }) => theme.fontSizeSmall};
    text-decoration: none;
  }
`;

export function PrimaryLink({ href, children, onClick }: OwnProps) {
  return (
    <StyledClickable>
      <ReactLink onClick={onClick} to={href}>
        {children}
      </ReactLink>
    </StyledClickable>
  );
}
