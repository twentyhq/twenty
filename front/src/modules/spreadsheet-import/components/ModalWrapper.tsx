import type React from 'react';
import styled from '@emotion/styled';

import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { Modal } from '@/ui/modal/components/Modal';

import { ModalCloseButton } from './ModalCloseButton';

const StyledModal = styled(Modal)`
  height: 61%;
  min-height: 600px;
  min-width: 800px;
  position: relative;
  width: 63%;
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
  const { rtl } = useSpreadsheetImportInternal();

  return (
    <StyledModal isOpen={isOpen}>
      <StyledRtlLtr dir={rtl ? 'rtl' : 'ltr'}>
        <ModalCloseButton onClose={onClose} />
        {children}
      </StyledRtlLtr>
    </StyledModal>
  );
};
