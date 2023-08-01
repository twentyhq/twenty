import type React from 'react';
import styled from '@emotion/styled';

import { Modal } from '@/ui/modal/components/Modal';

import { useRsi } from '../hooks/useRsi';

import { ModalCloseButton } from './ModalCloseButton';

const StyledModal = styled(Modal)`
  height: calc(100% - ${({ theme }) => theme.spacing(20)});
  width: calc(100% - ${({ theme }) => theme.spacing(20)});
`;

const StyledRtlLtr = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

type Props = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

export const ModalWrapper = ({ children, isOpen, onClose }: Props) => {
  const { rtl } = useRsi();

  return (
    <StyledModal isOpen={isOpen}>
      <StyledRtlLtr dir={rtl ? 'rtl' : 'ltr'}>
        <ModalCloseButton onClose={onClose} />
        {children}
      </StyledRtlLtr>
    </StyledModal>
  );
};
