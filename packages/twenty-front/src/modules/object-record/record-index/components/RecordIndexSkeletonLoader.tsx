import { styled } from '@linaria/react';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';
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
          layout="line"
          baseColor={themeCssVariables.background.tertiary}
          highlightColor={themeCssVariables.background.transparent.lighter}
          borderRadius={4}
          width={120}
          height={SKELETON_HEIGHT_SIZES.s}
        />
        <Skeleton
          layout="line"
          baseColor={themeCssVariables.background.tertiary}
          highlightColor={themeCssVariables.background.transparent.lighter}
          borderRadius={4}
          width={180}
          height={SKELETON_HEIGHT_SIZES.s}
        />
      </StyledSecondaryBar>
    }
  />
);
