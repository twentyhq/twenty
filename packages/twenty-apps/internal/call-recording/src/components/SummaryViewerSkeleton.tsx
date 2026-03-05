import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import {
  SKELETON_BASE_COLOR,
  SKELETON_HIGHLIGHT_COLOR,
  StyledSummarySkeletonContainer,
} from 'src/constants/skeleton-constants';

const StyledSkeletonCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

export const SummaryViewerSkeleton = () => {
  return (
    <SkeletonTheme
      baseColor={SKELETON_BASE_COLOR}
      highlightColor={SKELETON_HIGHLIGHT_COLOR}
      borderRadius={4}
    >
      <StyledSkeletonCard>
        <StyledSummarySkeletonContainer>
          <Skeleton height={16} width="40%" />
          <Skeleton height={14} count={3} style={{ marginBottom: 6 }} />
          <Skeleton height={16} width="55%" />
          <Skeleton height={14} count={2} style={{ marginBottom: 6 }} />
          <Skeleton height={14} width="75%" />
        </StyledSummarySkeletonContainer>
      </StyledSkeletonCard>
    </SkeletonTheme>
  );
};
