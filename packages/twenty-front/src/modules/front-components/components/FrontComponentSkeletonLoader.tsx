import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;

  & > span {
    display: block;
    height: 100%;
  }
`;

export const FrontComponentSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);

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
