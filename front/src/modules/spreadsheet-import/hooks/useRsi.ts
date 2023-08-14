import { useContext } from 'react';
import { SetRequired } from 'type-fest';

import { RsiContext } from '@/spreadsheet-import/components/core/Providers';
import { defaultRSIProps } from '@/spreadsheet-import/ReactSpreadsheetImport';
import { RsiProps } from '@/spreadsheet-import/types';

export const useRsi = <T extends string>() =>
  useContext<SetRequired<RsiProps<T>, keyof typeof defaultRSIProps>>(
    RsiContext,
  );
