import React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';

const StyledUndecoratedLink = styled(Link)`
  text-decoration: none;
`;

type UndecoratedLinkProps = {
  to: string;
  children: React.ReactNode;
  replace?: boolean;
};

export const UndecoratedLink = ({
  children,
  to,
  replace = false,
}: UndecoratedLinkProps) => {
  return (
    <StyledUndecoratedLink to={to} replace={replace}>
      {children}
    </StyledUndecoratedLink>
  );
};
