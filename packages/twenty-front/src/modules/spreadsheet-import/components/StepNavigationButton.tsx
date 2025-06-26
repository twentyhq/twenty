import styled from '@emotion/styled';

import { Modal } from '@/ui/layout/modal/components/Modal';
import { t } from '@lingui/core/macro';
import { CircularProgressBar } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const StyledFooter = styled(Modal.Footer)`
  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  gap: ${({ theme }) => theme.spacing(2.5)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(4)};
  height: auto;
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
