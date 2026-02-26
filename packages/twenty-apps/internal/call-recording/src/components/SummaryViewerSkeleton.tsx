import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import {
  SKELETON_BASE_COLOR,
  SKELETON_HIGHLIGHT_COLOR,
  StyledSummarySkeletonContainer,
} from 'src/constants/skeleton-constants';

export const SummaryViewerSkeleton = () => {
  return (
    <SkeletonTheme
      baseColor={SKELETON_BASE_COLOR}
      highlightColor={SKELETON_HIGHLIGHT_COLOR}
      borderRadius={4}
    >
      <StyledSummarySkeletonContainer>
        <Skeleton height={16} width="40%" />
        <Skeleton height={14} count={3} style={{ marginBottom: 4 }} />
        <Skeleton height={16} width="55%" />
        <Skeleton height={14} count={2} style={{ marginBottom: 4 }} />
        <Skeleton height={14} width="75%" />
      </StyledSummarySkeletonContainer>
    </SkeletonTheme>
  );
};
