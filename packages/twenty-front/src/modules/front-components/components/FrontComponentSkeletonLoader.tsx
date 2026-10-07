import { styled } from '@linaria/react';
import { Skeleton } from 'twenty-ui/primitives/feedback';
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
      <Skeleton
        layout="line"
        baseColor={themeCssVariables.background.tertiary}
        highlightColor={themeCssVariables.background.transparent.lighter}
        height="100%"
        borderRadius={themeCssVariables.border.radius.mdRound}
      />
    </StyledContainer>
  );
};
