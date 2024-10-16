import styled from '@emotion/styled';
import { BACKGROUND_LIGHT, MOBILE_VIEWPORT } from 'twenty-ui';

import { NAV_DRAWER_WIDTHS } from '@/ui/navigation/navigation-drawer/constants/NavDrawerWidths';
import { LeftPanelSkeletonLoader } from '~/loading/components/LeftPanelSkeletonLoader';
import { RightPanelSkeletonLoader } from '~/loading/components/RightPanelSkeletonLoader';

const StyledContainer = styled.div`
  background: ${BACKGROUND_LIGHT.noisy};
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: 12px;
  height: 100dvh;
  min-width: ${NAV_DRAWER_WIDTHS.menu.desktop.expanded}px;
  width: 100%;
  padding: 12px 8px 12px 8px;
  overflow: hidden;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

export const UserOrMetadataLoader = () => {
  return (
    <StyledContainer>
      <LeftPanelSkeletonLoader />
      <RightPanelSkeletonLoader />
    </StyledContainer>
  );
};
