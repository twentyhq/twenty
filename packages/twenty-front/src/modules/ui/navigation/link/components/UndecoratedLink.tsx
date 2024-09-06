import styled from '@emotion/styled';
import React from 'react';
import { Link } from 'react-router-dom';

const StyledUndecoratedLink = styled(Link)<{ fullWidth: boolean }>`
  text-decoration: none;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

type UndecoratedLinkProps = {
  to: string | number;
  children: React.ReactNode;
  replace?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  fullWidth?: boolean;
};

export const UndecoratedLink = ({
  children,
  to,
  replace = false,
  onClick,
  fullWidth = false,
}: UndecoratedLinkProps) => {
  return (
    <StyledUndecoratedLink
      to={to as string}
      replace={replace}
      onClick={onClick}
      fullWidth={fullWidth}
    >
      {children}
    </StyledUndecoratedLink>
  );
};
