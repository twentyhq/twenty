import * as React from 'react';
import styled from '@emotion/styled';

import { Pipeline } from '~/generated/graphql';

type OwnProps = {
  opportunity: Pipeline;
};

const StyledContainer = styled.span`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.primary};
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};

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
