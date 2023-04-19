import * as React from 'react';
import styled from '@emotion/styled';
import personPlaceholder from './placeholder.png';

type OwnProps = {
  name: string;
  picture?: string;
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

function PersonChip({ name, picture }: OwnProps) {
  console.log(picture ? picture.toString() : personPlaceholder);
  return (
    <StyledContainer data-testid="person-chip">
      <img
        data-testid="person-chip-image"
        src={picture ? picture.toString() : personPlaceholder.toString()}
        alt="person-picture"
      />
      {name}
    </StyledContainer>
  );
}

export default PersonChip;
