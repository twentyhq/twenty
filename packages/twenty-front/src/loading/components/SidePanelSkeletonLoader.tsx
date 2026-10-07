import { styled } from '@linaria/react';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
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
      <Skeleton height={SKELETON_HEIGHT_SIZES.m} width={140} />
    </StyledSidePanelContainer>
  );
};
