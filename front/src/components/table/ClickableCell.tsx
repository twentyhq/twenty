import styled from '@emotion/styled';
import * as React from 'react';
import { Link } from 'react-router-dom';

type OwnProps = {
  href: string;
  children?: React.ReactNode;
};

const StyledClickable = styled.div`
  position: relative;
  box-sizing: border-box;
  height: 32px;
  display: flex;
  align-items: center;

  ::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    border: 1px solid ${(props) => props.theme.text20};
    box-sizing: border-box;
    border-radius: 4px;
    pointer-events: none;
    display: none;
  }

  :hover::before {
    display: block;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;

const Container = styled.span`
  padding-left: ${(props) => props.theme.spacing(2)};
`;

function ClickableCell({ href, children }: OwnProps) {
  return (
    <StyledClickable>
      <Link to={href}>
        <Container>{children}</Container>
      </Link>
    </StyledClickable>
  );
}

export default ClickableCell;
