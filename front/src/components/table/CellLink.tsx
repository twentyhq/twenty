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
  border-radius: 4px;
  color: ${(props) => props.theme.text80};
  display: inline-flex;
  align-items: center;
  padding: 4px 8px 4px 4px;
  gap: 4px;

  img {
    height: 1rem;
    width: 1rem;
    border-radius: 0.5rem;
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
