import { Dialog } from 'twenty-ui/primitives/surfaces';
import { styled } from '@linaria/react';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { t } from '@lingui/core/macro';
import { Loader } from 'twenty-ui/primitives/feedback';
import { isDefined } from 'twenty-shared/utils';

const StyledNavigationActionButton = styled(Button)`
  --tw-button-font-weight: var(--t-font-weight-semi-bold);
  --tw-button-padding-inline: var(--t-spacing-3);
`;

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
          <StyledNavigationActionButton
            elevated
            startIcon={isLoading ? <Loader /> : undefined}
            onClick={!isLoading ? onBack : undefined}
            variant="outline"
          >
            {backTitle}
          </StyledNavigationActionButton>
        )}
        {isDefined(onContinue) && (
          <StyledNavigationActionButton
            elevated
            variant="solid"
            startIcon={isLoading ? <Loader /> : undefined}
            onClick={!isLoading ? onContinue : undefined}
            disabled={isContinueDisabled}
          >
            {continueTitle}
          </StyledNavigationActionButton>
        )}
      </Dialog.Footer>
    </StyledFooterContainer>
  );
};
