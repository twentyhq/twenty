import styled from '@emotion/styled';

import { CircularProgressBar } from '@/ui/feedback/progress-bar/components/CircularProgressBar';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { Modal } from '@/ui/layout/modal/components/Modal';

const StyledFooter = styled(Modal.Footer)`
  height: 60px;
  justify-content: center;
  padding: 0px;
  padding-left: ${({ theme }) => theme.spacing(30)};
  padding-right: ${({ theme }) => theme.spacing(30)};
`;

const StyledButton = styled(MainButton)`
  width: 200px;
`;

type StepNavigationButtonProps = {
  onClick: () => void;
  title: string;
  isLoading?: boolean;
};

export const StepNavigationButton = ({
  onClick,
  title,
  isLoading,
}: StepNavigationButtonProps) => (
  <StyledFooter>
    <StyledButton
      Icon={isLoading ? CircularProgressBar : undefined}
      title={title}
      onClick={!isLoading ? onClick : undefined}
    />
  </StyledFooter>
);
