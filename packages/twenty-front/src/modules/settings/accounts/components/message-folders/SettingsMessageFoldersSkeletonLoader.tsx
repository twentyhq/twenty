import { styled } from '@linaria/react';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

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
  return (
    <StyledSkeletonContainer>
      {SKELETON_ROWS.map((row, index) => (
        <StyledSkeletonRow key={index}>
          <StyledSkeletonFolderInfo>
            <Skeleton
              layout="line"
              baseColor={themeCssVariables.background.tertiary}
              highlightColor={themeCssVariables.background.transparent.lighter}
              borderRadius={4}
              width={20}
              height={SKELETON_HEIGHT_SIZES.s}
            />
            <Skeleton
              layout="line"
              baseColor={themeCssVariables.background.tertiary}
              highlightColor={themeCssVariables.background.transparent.lighter}
              borderRadius={4}
              width={row.width}
              height={SKELETON_HEIGHT_SIZES.s}
            />
          </StyledSkeletonFolderInfo>
          <Skeleton
            layout="line"
            baseColor={themeCssVariables.background.tertiary}
            highlightColor={themeCssVariables.background.transparent.lighter}
            borderRadius={4}
            width={16}
            height={SKELETON_HEIGHT_SIZES.s}
          />
        </StyledSkeletonRow>
      ))}
    </StyledSkeletonContainer>
  );
};
