import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

import { StyledSkeletonDiv } from './RecordInlineCellContainer';

export const RecordInlineCellSkeletonLoader = () => {
  return (
    <StyledSkeletonDiv>
      <Skeleton
        layout="line"
        baseColor={themeCssVariables.background.tertiary}
        highlightColor={themeCssVariables.background.transparent.lighter}
        borderRadius={4}
        width={154}
        height={SKELETON_HEIGHT_SIZES.s}
      />
    </StyledSkeletonDiv>
  );
};
