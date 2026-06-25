import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { StyledSkeletonDiv } from './RecordInlineCellContainer';

export const RecordInlineCellSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);
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
