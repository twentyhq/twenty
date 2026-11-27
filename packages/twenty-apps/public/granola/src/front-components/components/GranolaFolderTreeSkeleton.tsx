import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { SKELETON_HEIGHT_SIZES, Skeleton } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const FOLDER_NAME_WIDTHS_PIXELS = [140, 96, 180];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
  padding: ${() => themeCssVariables.spacing[2]} 0;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  padding: ${() => themeCssVariables.spacing[1]};
`;

const StyledFolderInfo = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${() => themeCssVariables.spacing[2]};
  min-width: 0;
`;

export const GranolaFolderTreeSkeleton = () => (
  <StyledContainer role="status" aria-label={t('Loading')}>
    {FOLDER_NAME_WIDTHS_PIXELS.map((nameWidthPixels) => (
      <StyledRow key={nameWidthPixels}>
        <StyledFolderInfo>
          <Skeleton
            width={SKELETON_HEIGHT_SIZES.s}
            height={SKELETON_HEIGHT_SIZES.s}
          />
          <Skeleton width={nameWidthPixels} height={SKELETON_HEIGHT_SIZES.s} />
        </StyledFolderInfo>
        <Skeleton
          width={SKELETON_HEIGHT_SIZES.s}
          height={SKELETON_HEIGHT_SIZES.s}
        />
      </StyledRow>
    ))}
  </StyledContainer>
);
