import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import {
  SKELETON_BASE_COLOR,
  SKELETON_HIGHLIGHT_COLOR,
  StyledSummarySkeletonContainer,
  StyledViewerSkeletonContainer,
} from 'src/constants/skeleton-constants';

export const CallRecordingViewerSkeleton = () => {
  return (
    <SkeletonTheme
      baseColor={SKELETON_BASE_COLOR}
      highlightColor={SKELETON_HIGHLIGHT_COLOR}
      borderRadius={4}
    >
      <StyledViewerSkeletonContainer>
        <Skeleton height={54} width="100%" borderRadius={8} />
        <StyledSummarySkeletonContainer>
          <Skeleton height={14} count={4} style={{ marginBottom: 4 }} />
          <Skeleton height={14} width="60%" />
        </StyledSummarySkeletonContainer>
      </StyledViewerSkeletonContainer>
    </SkeletonTheme>
  );
};
