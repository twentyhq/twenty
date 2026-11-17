import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';

import { NavigationDrawerWorkspaceSectionSkeletonLoader } from '@/object-metadata/components/NavigationDrawerWorkspaceSectionSkeletonLoader';
import { APP_HEADER_HEIGHT } from '@/ui/layout/constants/AppHeaderHeight';
import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerConstraints';
import { useIsMobile } from 'twenty-ui/utilities';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

// Same paddings and gap as the navigation drawer content, so the section skeleton lands where the drawer puts it.
const StyledAnimatedContainer = styled(motion.div)`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  height: 100%;
  overflow: hidden;
  padding-left: ${themeCssVariables.spacing[2]};
`;

const StyledTopBars = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  height: ${APP_HEADER_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[1]};
`;

// Same box as the expanded tab switcher.
const StyledTabs = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  height: ${themeCssVariables.spacing[10]};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

export const LeftPanelSkeletonLoader = () => {
  const theme = useTheme();
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
      <StyledTopBars>
        <StyledHeader>
          <SkeletonLine
            width={88}
            height={SKELETON_HEIGHT_SIZES.s}
            highlightColor={themeCssVariables.background.transparent.light}
          />
        </StyledHeader>
        <StyledTabs>
          <SkeletonLine
            width={64}
            height={SKELETON_HEIGHT_SIZES.s}
            highlightColor={themeCssVariables.background.transparent.light}
          />
        </StyledTabs>
      </StyledTopBars>
      <NavigationDrawerWorkspaceSectionSkeletonLoader />
    </StyledAnimatedContainer>
  );
};
