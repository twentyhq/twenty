import { MainButton } from '@/ui/input/components/MainButton';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { t } from '@lingui/core/macro';
import { CircularProgressBar } from 'twenty-ui/feedback';
import { ModalFooter } from 'twenty-ui/surfaces';
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
            startIcon={isLoading ? <CircularProgressBar /> : undefined}
            onClick={!isLoading ? onBack : undefined}
            variant="outline"
          >
            {backTitle}
          </MainButton>
        )}
        {!isUndefinedOrNull(onContinue) && (
          <MainButton
            startIcon={isLoading ? <CircularProgressBar /> : undefined}
            onClick={!isLoading ? onContinue : undefined}
            disabled={isContinueDisabled}
          >
            {continueTitle}
          </MainButton>
        )}
      </ModalFooter>
    </StyledFooterContainer>
  );
};
