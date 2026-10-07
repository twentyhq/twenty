import { styled } from '@linaria/react';
import { Skeleton } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledSidePanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

export const SidePanelSkeletonLoader = () => {
  return (
    <StyledSidePanelContainer>
      <Skeleton height={24} width={140} />
    </StyledSidePanelContainer>
  );
};
