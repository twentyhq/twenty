import { createContext } from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

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
  theme,
  rsiValues,
}: ProvidersProps<T>) => {
  const mergedTheme = extendTheme(theme);

  if (!rsiValues.fields) {
    throw new Error('Fields must be provided to react-spreadsheet-import');
  }

  return (
    <RsiContext.Provider value={rsiValues}>
      <ChakraProvider>
        {/* cssVarsRoot used to override RSI defaultTheme but not the rest of chakra defaultTheme */}
        <ChakraProvider cssVarsRoot={`#${rootId}`} theme={mergedTheme}>
          {children}
        </ChakraProvider>
      </ChakraProvider>
    </RsiContext.Provider>
  );
};
