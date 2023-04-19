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
