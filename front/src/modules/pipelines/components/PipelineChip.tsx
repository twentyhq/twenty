import * as React from 'react';
import styled from '@emotion/styled';

import { Pipeline } from '../interfaces/pipeline.interface';

type OwnProps = {
  opportunity: Pipeline;
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

function PipelineChip({ opportunity }: OwnProps) {
  return (
    <StyledContainer data-testid="company-chip" key={opportunity.id}>
      {opportunity.icon && <span>{opportunity.icon}</span>}
      <span>{opportunity.name}</span>
    </StyledContainer>
  );
}

export default PipelineChip;
