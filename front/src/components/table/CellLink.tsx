import * as React from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

type OwnProps = {
  name: string;
  picture?: string;
  href: string;
};

const StyledContainer = styled.span`
  background-color: ${(props) => props.theme.tertiaryBackground};
  border-radius: ${(props) => props.theme.spacing(1)};
  color: ${(props) => props.theme.text80};
  display: inline-flex;
  align-items: center;
  padding: ${(props) => props.theme.spacing(1)};
  gap: ${(props) => props.theme.spacing(1)};

  :hover {
    filter: brightness(95%);
  }

  img {
    height: 14px;
    width: 14px;
    object-fit: cover;
  }
`;

function CellLink({ name, picture, href }: OwnProps) {
  return (
    <Link to={href}>
      <StyledContainer>
        {picture && <img src={picture?.toString()} alt="" />}
        {name}
      </StyledContainer>
    </Link>
  );
}

export default CellLink;
