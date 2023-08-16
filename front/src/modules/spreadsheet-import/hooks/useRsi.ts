import { useContext } from 'react';
import { SetRequired } from 'type-fest';

import { RsiContext } from '@/spreadsheet-import/components/Providers';
import { defaultRSIProps } from '@/spreadsheet-import/provider/components/SpreadsheetImport';
import { SpreadsheetOptions } from '@/spreadsheet-import/types';

export const useRsi = <T extends string>() =>
  useContext<SetRequired<SpreadsheetOptions<T>, keyof typeof defaultRSIProps>>(
    RsiContext,
  );
