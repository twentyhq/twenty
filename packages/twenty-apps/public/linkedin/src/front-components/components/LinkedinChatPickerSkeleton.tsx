import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { SKELETON_HEIGHT_SIZES, Skeleton } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const SKELETON_ROW_WIDTHS = ['38%', '52%', '30%', '46%', '34%'];

const StyledRows = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  height: ${() => themeCssVariables.spacing[8]};
  padding-inline: ${() => themeCssVariables.spacing[1]};
`;

export const LinkedinChatPickerSkeleton = () => (
  <StyledRows aria-busy="true" aria-label={t('Loading')}>
    {SKELETON_ROW_WIDTHS.map((width) => (
      <StyledRow key={width}>
        <Skeleton
          layout="block"
          width={width}
          height={SKELETON_HEIGHT_SIZES.xs}
        />
      </StyledRow>
    ))}
  </StyledRows>
);
