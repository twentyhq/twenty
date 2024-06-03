import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { ANIMATION, BACKGROUND_LIGHT, GRAY_SCALE } from 'twenty-ui';

import { DESKTOP_NAV_DRAWER_WIDTHS } from '@/ui/navigation/navigation-drawer/constants/DesktopNavDrawerWidths';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { MainNavigationDrawerItemsSkeletonLoader } from '~/loading/components/MainNavigationDrawerItemsSkeletonLoader';

const StyledAnimatedContainer = styled(motion.div)`
  display: flex;
  justify-content: end;
`;

const StyledItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-bottom: auto;
  overflow-y: auto;
  height: calc(100vh - 32px);
  min-width: 216px;
  max-width: 216px;
`;

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const StyledSkeletonTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-left: 12px;
  margin-top: 8px;
`;

export const LeftPanelSkeletonLoader = () => {
  const isMobile = useIsMobile();
  const mobileWidth = isMobile ? 0 : '100%';
  const desktopWidth = !mobileWidth ? 12 : DESKTOP_NAV_DRAWER_WIDTHS.menu;

  return (
    <StyledAnimatedContainer
      initial={false}
      animate={{
        width: isMobile ? mobileWidth : desktopWidth,
        opacity: isMobile ? 0 : 1,
      }}
      transition={{
        duration: ANIMATION.duration.fast,
      }}
    >
      <StyledItemsContainer>
        <StyledSkeletonContainer>
          <StyledSkeletonTitleContainer>
            <SkeletonTheme
              baseColor={GRAY_SCALE.gray15}
              highlightColor={BACKGROUND_LIGHT.transparent.lighter}
              borderRadius={4}
            >
              <Skeleton width={96} height={16} />
            </SkeletonTheme>
          </StyledSkeletonTitleContainer>
          <MainNavigationDrawerItemsSkeletonLoader length={4} />
          <MainNavigationDrawerItemsSkeletonLoader title length={2} />
          <MainNavigationDrawerItemsSkeletonLoader title length={3} />
        </StyledSkeletonContainer>
      </StyledItemsContainer>
    </StyledAnimatedContainer>
  );
};
