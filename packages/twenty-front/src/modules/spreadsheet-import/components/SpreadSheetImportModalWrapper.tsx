import styled from '@emotion/styled';

import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';

import { Modal } from '@/ui/layout/modal/components/Modal';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import { SpreadSheetImportModalCloseButton } from './SpreadSheetImportModalCloseButton';

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

type SpreadSheetImportModalWrapperProps = {
  children: React.ReactNode;
  modalId: string;
  onClose: () => void;
};

export const SpreadSheetImportModalWrapper = ({
  modalId,
  children,
  onClose,
}: SpreadSheetImportModalWrapperProps) => {
  const { rtl } = useSpreadsheetImportInternal();

  return (
    <StyledModal
      size="large"
      modalId={modalId}
      isClosable={true}
      onClose={onClose}
    >
      <StyledRtlLtr dir={rtl ? 'rtl' : 'ltr'}>
        <SpreadSheetImportModalCloseButton onClose={onClose} />
        {children}
      </StyledRtlLtr>
    </StyledModal>
  );
};
