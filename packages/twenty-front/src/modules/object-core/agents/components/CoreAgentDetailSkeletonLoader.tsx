import { styled } from '@linaria/react';
import { Skeleton } from 'twenty-ui/primitives/feedback';

import { themeCssVariables } from 'twenty-ui/theme';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
`;

const StyledFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIconNameRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIconContainer = styled.div`
  flex-shrink: 0;
`;

const StyledNameContainer = styled.div`
  flex: 1;
`;

export const CoreAgentDetailSkeletonLoader = () => {
  return (
    <StyledSkeletonContainer>
      <StyledFormSection>
        <StyledIconNameRow>
          <StyledIconContainer>
            <Skeleton width={32} height={32} />
          </StyledIconContainer>
          <StyledNameContainer>
            <Skeleton height={32} width="100%" />
          </StyledNameContainer>
        </StyledIconNameRow>

        <Skeleton height={32} width="100%" />

        <Skeleton height={32} width="100%" />

        <Skeleton height={32} width="100%" />

        <Skeleton height={32} width="100%" />

        <Skeleton height={120} width="100%" />
      </StyledFormSection>
    </StyledSkeletonContainer>
  );
};
