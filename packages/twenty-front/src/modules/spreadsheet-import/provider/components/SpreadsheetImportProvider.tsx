import React from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';

import { SPREADSHEET_IMPORT_MODAL_ID } from '@/spreadsheet-import/constants/SpreadsheetImportModalId';
import { matchColumnsState } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/states/initialComputedColumnsState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SpreadsheetImport } from './SpreadsheetImport';

type SpreadsheetImportProviderProps = React.PropsWithChildren;

export const SpreadsheetImportProvider = (
  props: SpreadsheetImportProviderProps,
) => {
  const [spreadsheetImportDialog, setSpreadsheetImportDialog] = useRecoilState(
    spreadsheetImportDialogState,
  );

  const setMatchColumnsState = useSetRecoilState(matchColumnsState);

  const { closeModal } = useModal();

  const handleClose = () => {
    setSpreadsheetImportDialog({
      isOpen: false,
      options: null,
    });

    closeModal(SPREADSHEET_IMPORT_MODAL_ID);

    setMatchColumnsState([]);
  };

  return (
    <>
      {props.children}
      {spreadsheetImportDialog.isOpen && spreadsheetImportDialog.options && (
        <SpreadsheetImport
          onClose={handleClose}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...spreadsheetImportDialog.options}
        />
      )}
    </>
  );
};
