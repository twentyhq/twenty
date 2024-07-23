import React from 'react';
import { useRecoilState } from 'recoil';

import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';

import { SpreadsheetImport } from './SpreadsheetImport';

type SpreadsheetImportProviderProps = React.PropsWithChildren;

export const SpreadsheetImportProvider = (
  props: SpreadsheetImportProviderProps,
) => {
  const [spreadsheetImport, setSpreadsheetImport] = useRecoilState(
    spreadsheetImportDialogState,
  );

  const handleClose = () => {
    setSpreadsheetImport({
      isOpen: false,
      options: null,
    });
  };

  return (
    <>
      {props.children}
      {spreadsheetImport.isOpen && spreadsheetImport.options && (
        <SpreadsheetImport
          isOpen={true}
          onClose={handleClose}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...spreadsheetImport.options}
        />
      )}
    </>
  );
};
