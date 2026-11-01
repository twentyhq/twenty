import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { styled } from '@linaria/react';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const TITLE_WIDTH = 140;
const LAST_DESCRIPTION_LINE_WIDTH = '60%';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledDescription = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  margin-bottom: ${themeCssVariables.spacing[6]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

type SettingsSectionSkeletonLoaderProps = {
  rowCount?: number;
  hasHeader?: boolean;
};

export const SettingsSectionSkeletonLoader = ({
  rowCount = 4,
  hasHeader = false,
}: SettingsSectionSkeletonLoaderProps) => {
  const rows = (
    <SkeletonLine
      count={rowCount}
      height={SKELETON_HEIGHT_SIZES.l}
      gap={themeCssVariables.spacing[2]}
    />
  );

  if (!hasHeader) {
    return rows;
  }

  return (
    <StyledContainer>
      <SkeletonLine width={TITLE_WIDTH} height={SKELETON_HEIGHT_SIZES.s} />
      <StyledDescription>
        <SkeletonLine height={SKELETON_HEIGHT_SIZES.xs} />
        <SkeletonLine
          width={LAST_DESCRIPTION_LINE_WIDTH}
          height={SKELETON_HEIGHT_SIZES.xs}
        />
      </StyledDescription>
      {rows}
    </StyledContainer>
  );
};
