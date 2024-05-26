import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@emotion/react';

import { StyledSkeletonDiv } from './RecordInlineCellContainer';

export const RecordInlineCellSkeletonLoader = () => {
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonDiv>
        <Skeleton width={154} height={16} />
      </StyledSkeletonDiv>
    </SkeletonTheme>
  );
};
