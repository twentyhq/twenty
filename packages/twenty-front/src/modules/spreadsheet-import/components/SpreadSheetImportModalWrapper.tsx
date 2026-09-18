import { t } from '@lingui/core/macro';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { styled } from '@linaria/react';

import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';

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
    <DialogInstance
      dialogId={modalInstanceId}
      dismissible={true}
      onClose={onClose}
      closeOnDismiss={false}
    >
      {({ container, backdrop, viewportProps, onKeyDown }) => (
        <Dialog.Popup
          aria-label={t`Import data`}
          {...{ container, backdrop, viewportProps, onKeyDown }}
          size="xl"
          style={{ padding: 0, height: 'var(--t-modal-size-xl-height)' }}
        >
          <StyledInnerContainer>
            <StyledRtlLtr dir={rtl ? 'rtl' : 'ltr'}>
              <SpreadSheetImportModalCloseButton onClose={onClose} />
              {children}
            </StyledRtlLtr>
          </StyledInnerContainer>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
