import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { t } from '@lingui/core/macro';
import { CircularProgressBar } from 'twenty-ui/feedback';
import { Button } from 'twenty-ui/input';
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
          <Button
            startIcon={isLoading ? <CircularProgressBar /> : undefined}
            onClick={!isLoading ? onBack : undefined}
            elevated
            variant="outline"
            style={{
              fontWeight: 'var(--t-font-weight-semi-bold)',
              paddingInline: 'var(--t-spacing-3)',
            }}
          >
            {backTitle}
          </Button>
        )}
        {!isUndefinedOrNull(onContinue) && (
          <Button
            startIcon={isLoading ? <CircularProgressBar /> : undefined}
            onClick={!isLoading ? onContinue : undefined}
            disabled={isContinueDisabled}
            elevated
            variant="solid"
            style={{
              fontWeight: 'var(--t-font-weight-semi-bold)',
              paddingInline: 'var(--t-spacing-3)',
            }}
          >
            {continueTitle}
          </Button>
        )}
      </ModalFooter>
    </StyledFooterContainer>
  );
};
