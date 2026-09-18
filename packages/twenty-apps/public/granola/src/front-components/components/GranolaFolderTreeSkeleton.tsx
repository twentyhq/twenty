import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { StyledSkeletonBlock } from 'src/front-components/components/StyledSkeletonBlock';

const FOLDER_ROW_NAME_WIDTHS_PIXELS = [140, 96, 180];
const CHECKBOX_SKELETON_SIZE_PIXELS = 16;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${() => themeCssVariables.spacing[2]} 0;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  height: 28px;
`;

// Sits where the checkbox box sits inside its 5px button padding.
const StyledCheckboxSkeleton = styled(StyledSkeletonBlock)`
  margin: 5px;
`;

export const GranolaFolderTreeSkeleton = () => (
  <StyledList role="status" aria-label={t('Loading')}>
    {FOLDER_ROW_NAME_WIDTHS_PIXELS.map((nameWidthPixels) => (
      <StyledRow key={nameWidthPixels}>
        <StyledCheckboxSkeleton
          $width={CHECKBOX_SKELETON_SIZE_PIXELS}
          $height={CHECKBOX_SKELETON_SIZE_PIXELS}
        />
        <StyledSkeletonBlock $width={nameWidthPixels} $height={13} />
      </StyledRow>
    ))}
  </StyledList>
);
