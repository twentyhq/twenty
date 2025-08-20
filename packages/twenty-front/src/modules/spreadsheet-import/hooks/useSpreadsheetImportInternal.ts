import { useContext } from 'react';
import { type SetRequired } from 'type-fest';

import { RsiContext } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { type defaultSpreadsheetImportProps } from '@/spreadsheet-import/provider/components/SpreadsheetImport';
import { type SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';

export const useSpreadsheetImportInternal = () =>
  useContext<
    SetRequired<
      SpreadsheetImportDialogOptions,
      keyof typeof defaultSpreadsheetImportProps
    >
  >(RsiContext);
