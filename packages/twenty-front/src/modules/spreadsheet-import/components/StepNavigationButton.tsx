import styled from '@emotion/styled';

import { Modal } from '@/ui/layout/modal/components/Modal';
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
}: StepNavigationButtonProps) => {
  return (
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
};
