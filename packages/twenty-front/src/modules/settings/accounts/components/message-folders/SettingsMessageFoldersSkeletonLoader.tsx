import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledSkeletonRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledSkeletonFolderInfo = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[2]};
`;

const SKELETON_ROWS = [
  { width: 160 },
  { width: 120 },
  { width: 180 },
  { width: 140 },
  { width: 100 },
  { width: 150 },
];

export const SettingsMessageFoldersSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonContainer>
        {SKELETON_ROWS.map((row, index) => (
          <StyledSkeletonRow key={index}>
            <StyledSkeletonFolderInfo>
              <Skeleton
                width={20}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
              <Skeleton
                width={row.width}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
            </StyledSkeletonFolderInfo>
            <Skeleton
              width={16}
              height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
            />
          </StyledSkeletonRow>
        ))}
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};
