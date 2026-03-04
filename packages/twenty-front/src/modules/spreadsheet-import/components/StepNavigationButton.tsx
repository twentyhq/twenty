import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { t } from '@lingui/core/macro';
import { CircularProgressBar } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const StyledFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: row;
  gap: 10px;
  height: auto;
  justify-content: space-between;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[4]};
`;

type StepNavigationButtonProps = {
  onContinue?: () => void;
  continueTitle?: string;
  isContinueDisabled?: boolean;
  isLoading?: boolean;
  onBack?: () => void;
  backTitle?: string;
};

export const StepNavigationButton = ({
  onContinue,
  continueTitle = t`Continue`,
  isLoading,
  onBack,
  backTitle = t`Back`,
  isContinueDisabled = false,
}: StepNavigationButtonProps) => {
  return (
    <StyledFooter>
      {!isUndefinedOrNull(onBack) && (
        <MainButton
          Icon={isLoading ? CircularProgressBar : undefined}
          title={backTitle}
          onClick={!isLoading ? onBack : undefined}
          variant="secondary"
        />
      )}
      {!isUndefinedOrNull(onContinue) && (
        <MainButton
          Icon={isLoading ? CircularProgressBar : undefined}
          title={continueTitle}
          onClick={!isLoading ? onContinue : undefined}
          variant="primary"
          disabled={isContinueDisabled}
        />
      )}
    </StyledFooter>
  );
};
