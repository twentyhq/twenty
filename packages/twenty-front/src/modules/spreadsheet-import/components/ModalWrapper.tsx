import styled from '@emotion/styled';

import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';

import { Modal } from '@/ui/layout/modal/components/Modal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { RecoilRoot } from 'recoil';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
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
  modalId: string;
  isOpen: boolean;
  onClose: () => void;
};

export const ModalWrapper = ({
  modalId,
  children,
  isOpen,
  onClose,
}: ModalWrapperProps) => {
  const { rtl } = useSpreadsheetImportInternal();

  return (
    <RecoilRoot
      initializeState={({ set }) => {
        set(
          isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
          isOpen,
        );
      }}
    >
      {isOpen && (
        <StyledModal size="large" modalId={modalId}>
          <StyledRtlLtr dir={rtl ? 'rtl' : 'ltr'}>
            <ModalCloseButton onClose={onClose} />
            {children}
          </StyledRtlLtr>
        </StyledModal>
      )}
    </RecoilRoot>
  );
};
