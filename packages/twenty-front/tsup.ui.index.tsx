import { ThemeType } from 'twenty-ui';

export { ThemeProvider } from '@emotion/react';

export { THEME_DARK, THEME_LIGHT } from 'twenty-ui';

declare module '@emotion/react' {
  export interface Theme extends ThemeType {}
}