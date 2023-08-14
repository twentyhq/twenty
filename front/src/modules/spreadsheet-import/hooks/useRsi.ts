import { useContext } from 'react';
import { SetRequired } from 'type-fest';

import { RsiContext } from '@/spreadsheet-import/components/core/Providers';
import { defaultRSIProps } from '@/spreadsheet-import/components/SpreadsheetImport';
import { RsiProps } from '@/spreadsheet-import/types';

export const useRsi = <T extends string>() =>
  useContext<SetRequired<RsiProps<T>, keyof typeof defaultRSIProps>>(
    RsiContext,
  );
