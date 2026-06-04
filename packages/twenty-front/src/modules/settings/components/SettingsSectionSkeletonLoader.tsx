import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';

type SettingsSectionSkeletonLoaderProps = {
  rowCount?: number;
};

const StyledRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

// Body-only settings loading state: the rows that fill a settings page body
// while its data loads. Render this directly when the settings chrome is
// already on screen (e.g. a tab inside an already-rendered page). For a whole
// page with no chrome yet, use SettingsSkeletonLoader, which wraps this in the
// page chrome.
export const SettingsSectionSkeletonLoader = ({
  rowCount = 4,
}: SettingsSectionSkeletonLoaderProps) => {
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
