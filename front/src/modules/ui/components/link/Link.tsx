import * as React from 'react';
import { Link as ReactLink } from 'react-router-dom';
import styled from '@emotion/styled';

type OwnProps = {
  href: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

const StyledClickable = styled.div`
  display: flex;

  a {
    color: inherit;
    text-decoration: none;
  }
`;

function Link({ href, children, onClick }: OwnProps) {
  return (
    <StyledClickable>
      <ReactLink onClick={onClick} to={href}>
        {children}
      </ReactLink>
    </StyledClickable>
  );
}

export default Link;
