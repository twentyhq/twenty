import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import styled from '@emotion/styled';
import {
  BACKGROUND_LIGHT,
  BORDER_COMMON,
  BORDER_LIGHT,
  GRAY_SCALE,
  MOBILE_VIEWPORT,
} from 'twenty-ui';

const StyledMainContainer = styled.div`
  background: ${BACKGROUND_LIGHT.noisy};
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
  background: ${BACKGROUND_LIGHT.primary};
  border: 1px solid ${BORDER_LIGHT.color.medium};
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
  margin-top: 12px;
  margin-bottom: 14px;
`;

const StyledSkeletonHeaderLoader = () => {
  return (
    <StyledHeaderContainer>
      <SkeletonTheme
        baseColor={GRAY_SCALE.gray15}
        highlightColor={BACKGROUND_LIGHT.transparent.lighter}
        borderRadius={4}
      >
        <Skeleton height={16} width={104} />
      </SkeletonTheme>
    </StyledHeaderContainer>
  );
};

const StyledSkeletonAddLoader = () => {
  return (
    <SkeletonTheme
      baseColor={GRAY_SCALE.gray15}
      highlightColor={BACKGROUND_LIGHT.transparent.lighter}
      borderRadius={4}
    >
      <Skeleton width={132} height={16} />
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
