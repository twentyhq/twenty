import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/NavigationDrawerConstraints';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useTheme } from '@emotion/react';
import { ANIMATION } from 'twenty-ui/theme';
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
  gap: 14px;
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
  const theme = useTheme();

  return (
    <StyledAnimatedContainer
      initial={false}
      animate={{
        width: isMobile ? 0 : NAVIGATION_DRAWER_CONSTRAINTS.default,
        opacity: isMobile ? 0 : 1,
      }}
      transition={{ duration: ANIMATION.duration.fast }}
    >
      <StyledItemsContainer>
        <StyledSkeletonTitleContainer>
          <SkeletonTheme
            baseColor={theme.background.tertiary}
            highlightColor={theme.background.transparent.lighter}
            borderRadius={4}
          >
            <Skeleton
              width={96}
              height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
            />
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
