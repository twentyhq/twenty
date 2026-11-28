import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';

import { APP_HEADER_HEIGHT } from '@/ui/layout/constants/AppHeaderHeight';
import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerConstraints';
import { useIsMobile } from 'twenty-ui/utilities';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const NAVIGATION_ITEM_SKELETON_COUNT = 2;

const StyledAnimatedContainer = styled(motion.div)`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: ${APP_HEADER_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[1]};
`;

// Same box as the expanded tab switcher, so nothing moves when the drawer mounts.
const StyledTabs = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[10]};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[1]} 0;
`;

const StyledSectionLabel = styled.div`
  align-items: center;
  display: flex;
  height: ${themeCssVariables.spacing[4]};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledItem = styled.div`
  display: flex;
  flex-direction: column;
  height: ${themeCssVariables.spacing[7]};
  justify-content: center;
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
      <StyledHeader>
        <SkeletonLine
          width={88}
          height={SKELETON_HEIGHT_SIZES.s}
          baseColor={themeCssVariables.background.quaternary}
        />
      </StyledHeader>
      <StyledTabs>
        <SkeletonLine
          width={64}
          height={SKELETON_HEIGHT_SIZES.s}
          baseColor={themeCssVariables.background.quaternary}
        />
      </StyledTabs>
      <StyledSection>
        <StyledSectionLabel>
          <SkeletonLine
            width={48}
            height={SKELETON_HEIGHT_SIZES.xs}
            baseColor={themeCssVariables.background.quaternary}
          />
        </StyledSectionLabel>
        {Array.from({ length: NAVIGATION_ITEM_SKELETON_COUNT }).map(
          (_, index) => (
            <StyledItem key={index}>
              <SkeletonLine
                height={SKELETON_HEIGHT_SIZES.s}
                baseColor={themeCssVariables.background.quaternary}
              />
            </StyledItem>
          ),
        )}
      </StyledSection>
    </StyledAnimatedContainer>
  );
};
