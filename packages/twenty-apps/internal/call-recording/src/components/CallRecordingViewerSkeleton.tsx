import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import {
  SKELETON_BASE_COLOR,
  SKELETON_HIGHLIGHT_COLOR,
  StyledSummarySkeletonContainer,
  StyledViewerSkeletonContainer,
} from 'src/constants/skeleton-constants';

const StyledMediaSkeletonCard = styled.div`
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const StyledTranscriptSkeletonCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

export const CallRecordingViewerSkeleton = () => {
  return (
    <SkeletonTheme
      baseColor={SKELETON_BASE_COLOR}
      highlightColor={SKELETON_HIGHLIGHT_COLOR}
      borderRadius={4}
    >
      <StyledViewerSkeletonContainer>
        <StyledMediaSkeletonCard>
          <Skeleton height={54} width="100%" borderRadius={0} />
        </StyledMediaSkeletonCard>
        <StyledTranscriptSkeletonCard>
          <StyledSummarySkeletonContainer>
            <Skeleton height={14} count={4} style={{ marginBottom: 6 }} />
            <Skeleton height={14} width="60%" />
          </StyledSummarySkeletonContainer>
        </StyledTranscriptSkeletonCard>
      </StyledViewerSkeletonContainer>
    </SkeletonTheme>
  );
};
