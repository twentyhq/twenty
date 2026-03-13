import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/constants/PageBarMinHeight';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeaderSkeleton = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.noisy};
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-height: ${PAGE_BAR_MIN_HEIGHT}px;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeaderLeft = styled.div`
  flex: 1;
`;

export const PageContentSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <>
      <StyledHeaderSkeleton>
        <StyledHeaderLeft>
          <SkeletonTheme
            baseColor={theme.background.tertiary}
            highlightColor={theme.background.transparent.lighter}
            borderRadius={4}
          >
            <Skeleton
              height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              width={104}
            />
          </SkeletonTheme>
        </StyledHeaderLeft>
        <SkeletonTheme
          baseColor={theme.background.tertiary}
          highlightColor={theme.background.transparent.lighter}
          borderRadius={4}
        >
          <Skeleton
            width={132}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
        </SkeletonTheme>
      </StyledHeaderSkeleton>
      <PageBody>{null}</PageBody>
    </>
  );
};
