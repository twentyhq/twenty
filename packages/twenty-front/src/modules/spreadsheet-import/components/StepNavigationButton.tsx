import styled from '@emotion/styled';

import { CircularProgressBar } from '@/ui/feedback/progress-bar/components/CircularProgressBar';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const StyledFooter = styled(Modal.Footer)`
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
`;

type StepNavigationButtonProps = {
  onClick: () => void;
  title: string;
  isLoading?: boolean;
  onBack?: () => void;
};

export const StepNavigationButton = ({
  onClick,
  title,
  isLoading,
  onBack,
}: StepNavigationButtonProps) => (
  <StyledFooter>
    {!isUndefinedOrNull(onBack) && (
      <MainButton
        Icon={isLoading ? CircularProgressBar : undefined}
        title="Back"
        onClick={!isLoading ? onBack : undefined}
        variant="secondary"
      />
    )}
    <MainButton
      Icon={isLoading ? CircularProgressBar : undefined}
      title={title}
      onClick={!isLoading ? onClick : undefined}
      variant="primary"
    />
  </StyledFooter>
);
