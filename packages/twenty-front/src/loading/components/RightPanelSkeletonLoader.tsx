import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { BORDER_COMMON, MOBILE_VIEWPORT } from 'twenty-ui/theme';

const StyledMainContainer = styled.div`
  background: ${({ theme }) => theme.background.noisy};
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
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${BORDER_COMMON.radius.md};
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
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  height: 32px;
  margin-bottom: 12px;
`;

const StyledSkeletonHeaderLoader = () => {
  const theme = useTheme();

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
  const theme = useTheme();

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
