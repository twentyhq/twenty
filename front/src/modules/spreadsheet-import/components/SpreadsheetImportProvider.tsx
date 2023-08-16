import React from 'react';
import { useRecoilState } from 'recoil';

import { spreadsheetImportState } from '../states/spreadsheetImportState';

import { SpreadsheetImport } from './SpreadsheetImport';

type SpreadsheetImportProviderProps = React.PropsWithChildren;

export const SpreadsheetImportProvider = (
  props: SpreadsheetImportProviderProps,
) => {
  const [spreadsheetImportInternalState, setSpreadsheetImportInternalState] =
    useRecoilState(spreadsheetImportState);

  function handleClose() {
    setSpreadsheetImportInternalState({
      isOpen: false,
      options: null,
    });
  }

  return (
    <>
      {props.children}
      {spreadsheetImportInternalState.isOpen &&
        spreadsheetImportInternalState.options && (
          <SpreadsheetImport
            isOpen={true}
            onClose={handleClose}
            {...spreadsheetImportInternalState.options}
          />
        )}
    </>
  );
};
