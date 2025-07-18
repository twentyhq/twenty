import { useContext } from 'react';
import { SetRequired } from 'type-fest';

import { RsiContext } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { defaultSpreadsheetImportProps } from '@/spreadsheet-import/provider/components/SpreadsheetImport';
import { SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';

export const useSpreadsheetImportInternal = () =>
  useContext<
    SetRequired<
      SpreadsheetImportDialogOptions,
      keyof typeof defaultSpreadsheetImportProps
    >
  >(RsiContext);
