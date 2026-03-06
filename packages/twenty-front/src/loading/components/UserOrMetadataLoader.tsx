import { styled } from '@linaria/react';

import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/NavigationDrawerConstraints';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { ModalBackdrop } from 'twenty-ui/layout';
import { LeftPanelSkeletonLoader } from '~/loading/components/LeftPanelSkeletonLoader';
import { RightPanelSkeletonLoader } from '~/loading/components/RightPanelSkeletonLoader';

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.noisy};
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: 12px;
  height: 100dvh;
  min-width: ${NAVIGATION_DRAWER_CONSTRAINTS.default}px;
  overflow: hidden;
  padding: 12px 8px 12px 8px;
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

export const UserOrMetadataLoader = () => {
  const showAuthModal = useShowAuthModal();

  return (
    <StyledContainer>
      {showAuthModal && (
        <ModalBackdrop
          overlay="dark"
          backdropZIndex={RootStackingContextZIndices.RootModalBackDrop}
        />
      )}
      <LeftPanelSkeletonLoader />
      <RightPanelSkeletonLoader />
    </StyledContainer>
  );
};
