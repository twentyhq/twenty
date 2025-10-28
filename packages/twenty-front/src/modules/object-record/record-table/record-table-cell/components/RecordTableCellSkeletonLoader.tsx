import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const StyledSkeletonContainer = styled.div`
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1.6)};
`;

const StyledRecordTableCellLoader = ({ width }: { width?: number }) => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <Skeleton
        width={width}
        height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
      />
    </SkeletonTheme>
  );
};

export const RecordTableCellSkeletonLoader = () => {
  return (
    <StyledSkeletonContainer>
      <StyledRecordTableCellLoader />
    </StyledSkeletonContainer>
  );
};
