import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';

type SettingsAdminSectionSkeletonLoaderProps = {
  rowCount?: number;
};

const StyledRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

export const SettingsAdminSectionSkeletonLoader = ({
  rowCount = 4,
}: SettingsAdminSectionSkeletonLoaderProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledRows>
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.transparent.lighter}
        borderRadius={4}
      >
        <Skeleton
          count={rowCount}
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
        />
      </SkeletonTheme>
    </StyledRows>
  );
};
