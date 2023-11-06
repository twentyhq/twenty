import { ThemeProvider as EmotionThemProvider } from '@emotion/react';

import { lightTheme, ThemeType } from './src/modules/ui/theme/constants/theme';

export const ThemeProvider = ({ children }: { children: any }) => {
  return (
    <EmotionThemProvider theme={lightTheme}>{children}</EmotionThemProvider>
  );
};

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ThemeType {}
}

export * from './src/modules/ui/display/checkmark/components/Checkmark';
