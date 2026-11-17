import { styled } from '@linaria/react';

import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerConstraints';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';
import { LeftPanelSkeletonLoader } from '~/loading/components/LeftPanelSkeletonLoader';
import { PageContentSkeletonLoader } from '~/loading/components/PageContentSkeletonLoader';

// Same frame color as DefaultLayout, which takes over once the app is ready.
const StyledContainer = styled.div`
  background: ${themeCssVariables.grayScale.gray3};
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  height: calc(100dvh / var(--t-zoom, 1));
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
