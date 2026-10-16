import { createContext } from 'react';
import { type SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';
import { doNotTranslate, isDefined } from 'twenty-shared/utils';

export const RsiContext = createContext({} as any);

type ReactSpreadsheetImportContextProviderProps = {
  children: React.ReactNode;
  values: SpreadsheetImportDialogOptions;
};

export const ReactSpreadsheetImportContextProvider = ({
  children,
  values,
}: ReactSpreadsheetImportContextProviderProps) => {
  if (!isDefined(values.spreadsheetImportFields)) {
    throw new Error(
      doNotTranslate('Fields must be provided to spreadsheet-import'),
    );
  }

  return <RsiContext.Provider value={values}>{children}</RsiContext.Provider>;
};
