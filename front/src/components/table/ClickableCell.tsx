import styled from '@emotion/styled';
import * as React from 'react';
import { Link } from 'react-router-dom';

type OwnProps = {
  href: string;
  id: string;
  children?: React.ReactNode;
};

const TD = styled.td`
  position: relative;
  box-sizing: border-box;
  height: 32px;

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
    display: none;
  }

  :hover::before {
    display: block;
  }
`;

const Container = styled.span`
  padding-left: ${(props) => props.theme.spacing(2)};
`;

function ClickableCell({ href, children, id }: OwnProps) {
  return (
    <TD key={id}>
      <Link to={href}>
        <Container>{children}</Container>
      </Link>
    </TD>
  );
}

export default ClickableCell;
