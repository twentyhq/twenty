import { Dialog } from 'twenty-ui/primitives/surfaces';
import { styled } from '@linaria/react';
import { MainButton } from 'twenty-ui/components/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

const StyledFooter = styled(Dialog.Footer)`
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[5]};
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
      {isDefined(onBack) && (
        <MainButton
          loading={isLoading}
          loadingPosition="start"
          onClick={onBack}
          variant="outline"
        >
          {backTitle}
        </MainButton>
      )}
      {isDefined(onContinue) && (
        <MainButton
          loading={isLoading}
          loadingPosition="start"
          onClick={onContinue}
          disabled={isContinueDisabled}
        >
          {continueTitle}
        </MainButton>
      )}
    </StyledFooter>
  );
};
