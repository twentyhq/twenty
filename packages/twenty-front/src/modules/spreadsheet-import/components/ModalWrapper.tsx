import styled from '@emotion/styled';
import { MOBILE_VIEWPORT } from 'twenty-ui';

import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';

import { Modal } from '@/ui/layout/modal/components/Modal';
import { ModalCloseButton } from './ModalCloseButton';

const StyledModal = styled(Modal)`
  height: 61%;
  min-height: 600px;
  min-width: 800px;
  padding: 0;
  position: relative;
  width: 63%;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    min-width: auto;
    min-height: auto;
    width: 100%;
    height: 80%;
  }
`;

const StyledRtlLtr = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

type ModalWrapperProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

export const ModalWrapper = ({
  children,
  isOpen,
  onClose,
}: ModalWrapperProps) => {
  const { rtl } = useSpreadsheetImportInternal();

  return (
    <>
      {isOpen && (
        <StyledModal size="large">
          <StyledRtlLtr dir={rtl ? 'rtl' : 'ltr'}>
            <ModalCloseButton onClose={onClose} />
            {children}
          </StyledRtlLtr>
        </StyledModal>
      )}
    </>
  );
};
