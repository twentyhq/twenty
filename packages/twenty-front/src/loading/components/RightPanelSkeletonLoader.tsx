import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import {
  MOBILE_VIEWPORT,
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledMainContainer = styled.div`
  background: ${themeCssVariables.background.noisy};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  gap: 8px;
  min-height: 0;
  padding-left: 0;
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: 12px;
    padding-bottom: 0;
  }
`;

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  height: 100%;
  overflow: auto;
  width: 100%;
`;

const StyledHeaderContainer = styled.div`
  flex: 1;
`;
const StyledRightPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledRightPanelFlexContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 32px;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

const StyledSkeletonHeaderLoader = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledHeaderContainer>
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.transparent.lighter}
        borderRadius={4}
      >
        <Skeleton
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          width={104}
        />
      </SkeletonTheme>
    </StyledHeaderContainer>
  );
};

const StyledSkeletonAddLoader = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <Skeleton width={132} height={SKELETON_LOADER_HEIGHT_SIZES.standard.s} />
    </SkeletonTheme>
  );
};

const RightPanelSkeleton = () => (
  <StyledMainContainer>
    <StyledPanel></StyledPanel>
  </StyledMainContainer>
);

export const RightPanelSkeletonLoader = () => (
  <StyledRightPanelContainer>
    <StyledRightPanelFlexContainer>
      <StyledSkeletonHeaderLoader />
      <StyledSkeletonAddLoader />
    </StyledRightPanelFlexContainer>
    <RightPanelSkeleton />
  </StyledRightPanelContainer>
);
