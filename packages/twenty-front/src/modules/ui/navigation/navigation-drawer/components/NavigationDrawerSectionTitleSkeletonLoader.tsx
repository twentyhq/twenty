import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const StyledSkeletonTitle = styled.div`
  margin-bottom: ${(props) => props.theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

export const NavigationDrawerSectionTitleSkeletonLoader = () => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonTitle>
        <Skeleton
          width={56}
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.xs}
        />
      </StyledSkeletonTitle>
    </SkeletonTheme>
  );
};
