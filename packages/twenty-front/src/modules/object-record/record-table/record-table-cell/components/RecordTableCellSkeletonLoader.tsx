import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSkeletonContainer = styled.div`
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing['1.5']};
`;

const StyledRecordTableCellLoader = ({ width }: { width?: number }) => {
  const { theme } = useContext(ThemeContext);
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
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
