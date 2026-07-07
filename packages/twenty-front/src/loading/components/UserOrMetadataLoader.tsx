import { styled } from '@linaria/react';

import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/NavigationDrawerConstraints';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { LeftPanelSkeletonLoader } from '~/loading/components/LeftPanelSkeletonLoader';
import { PageContentSkeletonLoader } from '~/loading/components/PageContentSkeletonLoader';

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.tertiary};
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  height: 100dvh;
  min-width: ${NAVIGATION_DRAWER_CONSTRAINTS.default}px;
  overflow: hidden;
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

const StyledLeftPanelWrapper = styled.div`
  flex-shrink: 0;
`;

export const UserOrMetadataLoader = () => {
  return (
    <StyledContainer>
      <StyledLeftPanelWrapper>
        <LeftPanelSkeletonLoader />
      </StyledLeftPanelWrapper>
      <PageContentSkeletonLoader />
    </StyledContainer>
  );
};
