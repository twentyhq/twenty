import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSkeletonDiv = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
  height: 24px;
`;
export const PropertyBoxSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);
  const skeletonItems = Array.from({ length: 4 }).map((_, index) => ({
    id: `skeleton-item-${index}`,
  }));
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      {skeletonItems.map(({ id }) => (
        <StyledSkeletonDiv key={id}>
          <Skeleton
            width={92}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
          <Skeleton
            width={154}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
        </StyledSkeletonDiv>
      ))}
    </SkeletonTheme>
  );
};
