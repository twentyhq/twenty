import * as React from 'react';
import styled from '@emotion/styled';

export type CompanyChipPropsType = {
  name: string;
  picture?: string;
  clickHandler?: (editing: boolean) => void;
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

  [data-editmode='selected'] &:hover {
    cursor: pointer;
  }

  [data-editmode='selected'] &:hover::after {
    content: '✖️';
    display: block;
  }

  img {
    height: 14px;
    width: 14px;
    object-fit: cover;
  }
`;

function CompanyChip({ name, picture, clickHandler }: CompanyChipPropsType) {
  return (
    <StyledContainer
      data-testid="company-chip"
      onClick={(event) => {
        if (clickHandler)
          clickHandler(
            !!event.currentTarget.closest('[data-editmode="selected"]'),
          );
      }}
    >
      {picture && (
        <img
          data-testid="company-chip-image"
          src={picture?.toString()}
          alt={`${name}-company-logo`}
        />
      )}
      {name}
    </StyledContainer>
  );
}

export default CompanyChip;
