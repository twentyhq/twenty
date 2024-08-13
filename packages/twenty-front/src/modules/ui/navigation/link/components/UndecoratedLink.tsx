import styled from '@emotion/styled';
import React from 'react';
import { Link } from 'react-router-dom';

const StyledUndecoratedLink = styled(Link)`
  text-decoration: none;
`;

type UndecoratedLinkProps = {
  to: string | number;
  children: React.ReactNode;
  replace?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export const UndecoratedLink = ({
  children,
  to,
  replace = false,
  onClick,
}: UndecoratedLinkProps) => {
  return (
    <StyledUndecoratedLink
      to={to as string}
      replace={replace}
      onClick={onClick}
    >
      {children}
    </StyledUndecoratedLink>
  );
};
