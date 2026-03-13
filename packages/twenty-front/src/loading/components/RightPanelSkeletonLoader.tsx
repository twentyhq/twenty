import { PageContentSkeletonLoader } from '~/loading/components/PageContentSkeletonLoader';
import { styled } from '@linaria/react';

const StyledRightPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const RightPanelSkeletonLoader = () => (
  <StyledRightPanelContainer>
    <PageContentSkeletonLoader />
  </StyledRightPanelContainer>
);
