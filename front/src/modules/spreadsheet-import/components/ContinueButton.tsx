import styled from '@emotion/styled';

import { MainButton } from '@/ui/button/components/MainButton';
import { Modal } from '@/ui/modal/components/Modal';

const Footer = styled(Modal.Footer)`
  height: 60px;
  justify-content: center;
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
    <Button title={title} onClick={onContinue}>
      {title}
    </Button>
  </Footer>
);
