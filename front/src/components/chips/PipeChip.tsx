import * as React from 'react';
import styled from '@emotion/styled';

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
`;

function PipeChip({ name, picture }: OwnProps) {
  return (
    <StyledContainer data-testid="company-chip">
      {picture && <span>{picture}</span>}
      <span>{name}</span>
    </StyledContainer>
  );
}

export default PipeChip;
