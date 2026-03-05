import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledSkeletonContainer = styled.div`
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing['1.5']};
`;

const StyledRecordTableCellLoader = ({ width }: { width?: number }) => {
  return (
    <SkeletonTheme
      baseColor={resolveThemeVariable(themeCssVariables.background.tertiary)}
      highlightColor={resolveThemeVariable(
        themeCssVariables.background.transparent.lighter,
      )}
      borderRadius={4}
    >
      <Skeleton
        width={width}
        height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
      />
    </SkeletonTheme>
  );
};

export const RecordTableCellSkeletonLoader = () => {
  return (
    <StyledSkeletonContainer>
      <StyledRecordTableCellLoader />
    </StyledSkeletonContainer>
  );
};
