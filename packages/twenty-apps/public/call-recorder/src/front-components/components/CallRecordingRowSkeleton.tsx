import styled from '@emotion/styled';
import { useTranslate } from 'twenty-sdk/front-component';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { StyledCallRecordingRowLayout } from 'src/front-components/components/StyledCallRecordingRowLayout';
import { StyledChipSkeleton } from 'src/front-components/components/StyledChipSkeleton';

const StyledRightContent = styled.span`
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
`;

export const CallRecordingRowSkeleton = () => {
  const { t } = useTranslate();

  return (
    <StyledCallRecordingRowLayout
      aria-busy
      aria-label={t('Loading call recordings')}
    >
      <StyledChipSkeleton $width={themeCssVariables.spacing[32]} />
      <StyledRightContent>
        <StyledChipSkeleton $width={themeCssVariables.spacing[11]} />
        <StyledChipSkeleton $width={themeCssVariables.spacing[14]} />
      </StyledRightContent>
    </StyledCallRecordingRowLayout>
  );
};
