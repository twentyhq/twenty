import { ThemeProvider as EmotionThemProvider } from '@emotion/react';

import { lightTheme, ThemeType } from './theme/constants/theme';

export const ThemeProvider = ({ children }: { children: any }) => {
  return (
    <EmotionThemProvider theme={lightTheme}>{children}</EmotionThemProvider>
  );
};

import '@emotion/react';

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ThemeType {}
}

export * from './display/checkmark/components/Checkmark';
