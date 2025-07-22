import { useContext } from 'react';
import { SetRequired } from 'type-fest';

import { RsiContext } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { defaultSpreadsheetImportProps } from '@/spreadsheet-import/provider/components/SpreadsheetImport';
import { SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';

export const useSpreadsheetImportInternal = <T extends string>() =>
  useContext<
    SetRequired<
      SpreadsheetImportDialogOptions<T>,
      keyof typeof defaultSpreadsheetImportProps
    >
  >(RsiContext);
