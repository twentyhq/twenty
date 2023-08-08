import { createContext } from 'react';

import type { CustomTheme } from '../theme';
import type { RsiProps } from '../types';

export const RsiContext = createContext({} as any);

type ProvidersProps<T extends string> = {
  children: React.ReactNode;
  theme: CustomTheme;
  rsiValues: RsiProps<T>;
};

export const rootId = 'chakra-modal-rsi';

export const Providers = <T extends string>({
  children,
  rsiValues,
}: ProvidersProps<T>) => {
  if (!rsiValues.fields) {
    throw new Error('Fields must be provided to react-spreadsheet-import');
  }

  return (
    <RsiContext.Provider value={rsiValues}>{children}</RsiContext.Provider>
  );
};
