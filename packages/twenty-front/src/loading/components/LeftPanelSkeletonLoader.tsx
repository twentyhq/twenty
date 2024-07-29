import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ANIMATION, BACKGROUND_LIGHT, GRAY_SCALE } from 'twenty-ui';

import { DESKTOP_NAV_DRAWER_WIDTHS } from '@/ui/navigation/navigation-drawer/constants/DesktopNavDrawerWidths';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { MainNavigationDrawerItemsSkeletonLoader } from '~/loading/components/MainNavigationDrawerItemsSkeletonLoader';

const StyledAnimatedContainer = styled(motion.div)`
  align-items: center;
  display: flex;
  justify-content: end;
`;

const StyledItemsContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100dvh - 32px);
  margin-bottom: auto;
  max-width: 204px;
  min-width: 204px;
  overflow-y: auto;
`;

const StyledSkeletonContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const StyledSkeletonTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
  height: 32px;

  max-width: 196px;
  min-width: 196px;
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
        <StyledSkeletonTitleContainer>
          <SkeletonTheme
            baseColor={GRAY_SCALE.gray15}
            highlightColor={BACKGROUND_LIGHT.transparent.lighter}
            borderRadius={4}
          >
            <Skeleton width={96} height={16} />
          </SkeletonTheme>
        </StyledSkeletonTitleContainer>
        <StyledSkeletonContainer>
          <MainNavigationDrawerItemsSkeletonLoader length={3} />
          <MainNavigationDrawerItemsSkeletonLoader title length={2} />
          <MainNavigationDrawerItemsSkeletonLoader title length={3} />
        </StyledSkeletonContainer>
      </StyledItemsContainer>
    </StyledAnimatedContainer>
  );
};
