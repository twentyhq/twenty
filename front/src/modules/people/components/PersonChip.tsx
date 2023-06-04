import * as React from 'react';
import styled from '@emotion/styled';

import PersonPlaceholder from './person-placeholder.png';

export type PersonChipPropsType = {
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

  overflow: hidden;
  white-space: nowrap;

  :hover {
    filter: brightness(95%);
  }

  img {
    height: 14px;
    width: 14px;
    border-radius: 100%;
    object-fit: cover;
  }
`;

export function PersonChip({ name, picture }: PersonChipPropsType) {
  return (
    <StyledContainer data-testid="person-chip">
      <img
        data-testid="person-chip-image"
        src={picture ? picture.toString() : PersonPlaceholder.toString()}
        alt="person"
      />
      {name}
    </StyledContainer>
  );
}
