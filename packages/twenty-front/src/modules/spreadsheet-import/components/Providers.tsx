import { createContext } from 'react';

import { SpreadsheetOptions } from '@/spreadsheet-import/types';
import useI18n from '@/ui/i18n/useI18n';

export const RsiContext = createContext({} as any);
type ProvidersProps<T extends string> = {
  children: React.ReactNode;
  values: SpreadsheetOptions<T>;
};

export const Providers = <T extends string>({
  children,
  values,
}: ProvidersProps<T>) => {
  const { translate } = useI18n('translations');

  if (!values.fields) {
    throw new Error(translate('provideFields'));
  }

  return <RsiContext.Provider value={values}>{children}</RsiContext.Provider>;
};
