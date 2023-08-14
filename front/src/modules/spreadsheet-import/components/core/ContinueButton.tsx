import styled from '@emotion/styled';

import { MainButton } from '@/ui/button/components/MainButton';
import { Modal } from '@/ui/modal/components/Modal';
import { CircularProgressBar } from '@/ui/progress-bar/components/CircularProgressBar';

const Footer = styled(Modal.Footer)`
  height: 60px;
  justify-content: center;
  padding: 0px;
  padding-left: ${({ theme }) => theme.spacing(30)};
  padding-right: ${({ theme }) => theme.spacing(30)};
`;

const Button = styled(MainButton)`
  width: 200px;
`;

type ContinueButtonProps = {
  onContinue: (val: any) => void;
  title: string;
  isLoading?: boolean;
};

export const ContinueButton = ({
  onContinue,
  title,
  isLoading,
}: ContinueButtonProps) => (
  <Footer>
    <Button
      icon={isLoading && <CircularProgressBar size={16} barWidth={2} />}
      title={title}
      onClick={!isLoading ? onContinue : undefined}
    />
  </Footer>
);
