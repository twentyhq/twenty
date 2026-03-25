import { styled } from '@linaria/react';

import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';

import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme-constants';
import { SpreadSheetImportModalCloseButton } from './SpreadSheetImportModalCloseButton';

const StyledInnerContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 600px;
  min-width: 800px;
  position: relative;
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
  modalInstanceId: string;
  onClose: () => void;
};

export const SpreadSheetImportModalWrapper = ({
  modalInstanceId,
  children,
  onClose,
}: SpreadSheetImportModalWrapperProps) => {
  const { rtl } = useSpreadsheetImportInternal();

  return (
    <ModalStatefulWrapper
      size="extraLarge"
      padding="none"
      modalInstanceId={modalInstanceId}
      isClosable={true}
      onClose={onClose}
      shouldCloseModalOnClickOutsideOrEscape={false}
    >
      <StyledInnerContainer>
        <StyledRtlLtr dir={rtl ? 'rtl' : 'ltr'}>
          <SpreadSheetImportModalCloseButton onClose={onClose} />
          {children}
        </StyledRtlLtr>
      </StyledInnerContainer>
    </ModalStatefulWrapper>
  );
};
