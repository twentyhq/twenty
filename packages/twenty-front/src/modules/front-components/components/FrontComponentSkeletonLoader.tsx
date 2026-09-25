import { styled } from '@linaria/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;

  & > span {
    display: block;
    height: 100%;
  }
`;

export const FrontComponentSkeletonLoader = () => {
  const theme = useTheme();

  return (
    <StyledContainer>
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.transparent.lighter}
        borderRadius={theme.border.radius.md}
      >
        <Skeleton height="100%" />
      </SkeletonTheme>
    </StyledContainer>
  );
};
