import {  ThemeType } from './src/modules/ui/theme/constants/theme';

export {ThemeProvider} from '@emotion/react';

export {lightTheme, darkTheme} from './src/modules/ui/theme/constants/theme';

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ThemeType {}
}

export * from './src/modules/ui/display/checkmark/components/Checkmark';
export * from './src/modules/ui/input/button/components/Button';
