import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSecondaryBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  min-height: ${themeCssVariables.spacing[10]};
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

export const RecordIndexSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <PageCardLayout
        header={
          <PageCardHeader
            icon={<Skeleton width={20} height={20} />}
            title={
              <Skeleton
                width={120}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
            }
          />
        }
        secondaryBar={
          <StyledSecondaryBar>
            <Skeleton
              width={120}
              height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
            />
            <Skeleton
              width={180}
              height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
            />
          </StyledSecondaryBar>
        }
      >
        <StyledBody>
          <Skeleton
            count={8}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
          />
        </StyledBody>
      </PageCardLayout>
    </SkeletonTheme>
  );
};
