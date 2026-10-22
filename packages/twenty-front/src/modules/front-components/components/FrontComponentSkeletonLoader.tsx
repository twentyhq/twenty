import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

const skeletonLineContainerClassName = css`
  height: 100%;
`;

export const FrontComponentSkeletonLoader = () => {
  return (
    <StyledContainer>
      <SkeletonLine
        containerClassName={skeletonLineContainerClassName}
        height="100%"
        borderRadius={themeCssVariables.border.radius.mdRound}
      />
    </StyledContainer>
  );
};
