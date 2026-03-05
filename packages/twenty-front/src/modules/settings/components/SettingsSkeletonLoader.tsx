import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledTitleLoaderContainer = styled.div`
  margin: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[8]}
    ${themeCssVariables.spacing[2]};
`;

export const SettingsSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledContainer>
      <PageHeader
        title={
          <SkeletonTheme
            baseColor={theme.background.tertiary}
            highlightColor={theme.background.transparent.lighter}
            borderRadius={4}
          >
            <Skeleton
              height={SKELETON_LOADER_HEIGHT_SIZES.standard.m}
              width={120}
            />{' '}
          </SkeletonTheme>
        }
      />
      <PageBody>
        <StyledTitleLoaderContainer>
          <SkeletonTheme
            baseColor={theme.background.tertiary}
            highlightColor={theme.background.transparent.lighter}
            borderRadius={4}
          >
            <Skeleton
              height={SKELETON_LOADER_HEIGHT_SIZES.standard.m}
              width={200}
            />
          </SkeletonTheme>
        </StyledTitleLoaderContainer>
      </PageBody>
    </StyledContainer>
  );
};
