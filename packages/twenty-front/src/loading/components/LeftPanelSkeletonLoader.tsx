import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/NavigationDrawerConstraints';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { MainNavigationDrawerItemsSkeletonLoader } from '~/loading/components/MainNavigationDrawerItemsSkeletonLoader';
import { useContext } from 'react';
import {
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledAnimatedContainer = styled(motion.div)`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[3]} 0 ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[2]};
`;

const StyledItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
  width: 100%;
`;

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
`;

const StyledSkeletonTitleContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 32px;
  justify-content: center;
  width: 100%;
`;

export const LeftPanelSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  return (
    <StyledAnimatedContainer
      initial={false}
      animate={{
        width: isMobile ? 0 : NAVIGATION_DRAWER_CONSTRAINTS.default,
        opacity: isMobile ? 0 : 1,
      }}
      transition={{
        duration: theme.animation.duration.fast,
      }}
    >
      <StyledItemsContainer>
        <StyledSkeletonTitleContainer>
          <SkeletonTheme
            baseColor={theme.background.quaternary}
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
