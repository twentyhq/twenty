import { Skeleton } from 'twenty-ui/primitives/feedback';

import { StyledSkeletonDiv } from './RecordInlineCellContainer';

export const RecordInlineCellSkeletonLoader = () => {
  return (
    <StyledSkeletonDiv>
      <Skeleton width={154} height={16} />
    </StyledSkeletonDiv>
  );
};
