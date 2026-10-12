import { Dialog } from 'twenty-ui/primitives/surfaces';
import { styled } from '@linaria/react';
import { MainButton } from 'twenty-ui/components/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { t } from '@lingui/core/macro';
import { Loader } from 'twenty-ui/primitives/feedback';
import { isDefined } from 'twenty-shared/utils';

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
      <Dialog.Footer style={{ padding: 'var(--t-spacing-5)' }}>
        {isDefined(onBack) && (
          <MainButton
            startIcon={isLoading ? <Loader /> : undefined}
            onClick={!isLoading ? onBack : undefined}
            variant="outline"
          >
            {backTitle}
          </MainButton>
        )}
        {isDefined(onContinue) && (
          <MainButton
            startIcon={isLoading ? <Loader /> : undefined}
            onClick={!isLoading ? onContinue : undefined}
            disabled={isContinueDisabled}
          >
            {continueTitle}
          </MainButton>
        )}
      </Dialog.Footer>
    </StyledFooterContainer>
  );
};
