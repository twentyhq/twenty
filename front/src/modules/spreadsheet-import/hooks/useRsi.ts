import { useContext } from 'react';
import { SetRequired } from 'type-fest';

import { RsiContext } from '../components/Providers';
import { defaultRSIProps } from '../ReactSpreadsheetImport';
import { Translations } from '../translationsRSIProps';
import { RsiProps } from '../types';

export const useRsi = <T extends string>() =>
  useContext<
    SetRequired<RsiProps<T>, keyof typeof defaultRSIProps> & {
      translations: Translations;
    }
  >(RsiContext);
