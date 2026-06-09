import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import Skeleton from 'react-loading-skeleton';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { PageContentSkeletonLoader } from '~/loading/components/PageContentSkeletonLoader';

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

export const RecordIndexSkeletonLoader = () => (
  <PageContentSkeletonLoader
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
  />
);
