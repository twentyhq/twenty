import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { themeCssVariables } from 'twenty-ui/theme';

type FrontComponentSkeletonLoaderProps = {
  height?: string;
};

const StyledContainer = styled.div<{ loaderHeight: string }>`
  height: ${({ loaderHeight }) => loaderHeight};
  width: 100%;
`;

const skeletonLineContainerClassName = css`
  height: 100%;
`;

export const FrontComponentSkeletonLoader = ({
  height = '100%',
}: FrontComponentSkeletonLoaderProps) => {
  return (
    <StyledContainer loaderHeight={height}>
      <SkeletonLine
        containerClassName={skeletonLineContainerClassName}
        height="100%"
        borderRadius={themeCssVariables.border.radius.mdRound}
      />
    </StyledContainer>
  );
};
