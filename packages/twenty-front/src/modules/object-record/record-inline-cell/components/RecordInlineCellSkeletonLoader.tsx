import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { useTheme } from 'twenty-ui/theme';
import { StyledSkeletonDiv } from './RecordInlineCellContainer';
import { SKELETON_LOADER_HEIGHT_SIZES } from '@/ui/feedback/skeleton-loader/constants/SkeletonLoaderHeightSizes';

export const RecordInlineCellSkeletonLoader = () => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonDiv>
        <Skeleton
          width={154}
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
        />
      </StyledSkeletonDiv>
    </SkeletonTheme>
  );
};
