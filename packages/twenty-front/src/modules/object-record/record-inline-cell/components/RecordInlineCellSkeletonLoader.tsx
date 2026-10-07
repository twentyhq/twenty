import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';

import { StyledSkeletonDiv } from './RecordInlineCellContainer';

export const RecordInlineCellSkeletonLoader = () => {
  return (
    <StyledSkeletonDiv>
      <Skeleton width={154} height={SKELETON_HEIGHT_SIZES.s} />
    </StyledSkeletonDiv>
  );
};
