import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { t } from '@lingui/core/macro';
import { CircularProgressBar } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { ModalFooter } from 'twenty-ui/layout';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const StyledFooterContainer = styled.div`
  > div {
    border-top: 1px solid ${themeCssVariables.border.color.medium};
    box-shadow: ${themeCssVariables.boxShadow.strong};
    justify-content: space-between;
  }
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
    <StyledFooterContainer>
      <ModalFooter autoHeight>
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
      </ModalFooter>
    </StyledFooterContainer>
  );
};
