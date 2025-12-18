import styled from '@emotion/styled';

import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/NavigationDrawerConstraints';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import { LeftPanelSkeletonLoader } from '~/loading/components/LeftPanelSkeletonLoader';
import { RightPanelSkeletonLoader } from '~/loading/components/RightPanelSkeletonLoader';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.noisy};
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: 12px;
  height: 100dvh;
  min-width: ${NAVIGATION_DRAWER_CONSTRAINTS.default}px;
  width: 100%;
  padding: 12px 8px 12px 8px;
  overflow: hidden;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

export const UserOrMetadataLoader = () => {
  const showAuthModal = useShowAuthModal();

  return (
    <StyledContainer>
      {showAuthModal && <Modal.Backdrop modalVariant="primary" />}
      <LeftPanelSkeletonLoader />
      <RightPanelSkeletonLoader />
    </StyledContainer>
  );
};
