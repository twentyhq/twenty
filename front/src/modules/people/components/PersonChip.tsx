import * as React from 'react';
import styled from '@emotion/styled';

import PersonPlaceholder from './person-placeholder.png';

export type PersonChipPropsType = {
  name: string;
  picture?: string;
};

const StyledContainer = styled.span`
  align-items: center;
  background-color: ${(props) => props.theme.tertiaryBackground};
  border-radius: ${(props) => props.theme.spacing(1)};
  color: ${(props) => props.theme.text80};
  display: inline-flex;
  gap: ${(props) => props.theme.spacing(1)};
  height: 12px;

  overflow: hidden;
  padding: ${(props) => props.theme.spacing(1)};

  :hover {
    filter: brightness(95%);
  }

  img {
    border-radius: 100%;
    height: 14px;
    object-fit: cover;
    width: 14px;
  }

  white-space: nowrap;
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
