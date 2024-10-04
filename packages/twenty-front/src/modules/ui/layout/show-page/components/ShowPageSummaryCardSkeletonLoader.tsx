import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  height: ${({ theme }) => theme.spacing(19)};
  margin: ${({ theme }) => theme.spacing(4)};
`;

const StyledRectangularSkeleton = styled(Skeleton)`
  height: ${({ theme }) => theme.spacing(4)};
  width: ${({ theme }) => theme.spacing(24)};
  margin: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

export const ShowPageSummaryCardSkeletonLoader = () => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
    >
      <StyledContainer>
        <Skeleton
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.xl}
          width={40}
        />
        <StyledRectangularSkeleton />
      </StyledContainer>
    </SkeletonTheme>
  );
};
