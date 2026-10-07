import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { styled } from '@linaria/react';

import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;

  & > span {
    display: block;
    height: 100%;
  }
`;

export const FrontComponentSkeletonLoader = () => {
  return (
    <StyledContainer>
      <SkeletonLine
        height="100%"
        borderRadius={themeCssVariables.border.radius.mdRound}
      />
    </StyledContainer>
  );
};
