import { ThemeType } from './src/modules/ui/theme/constants/ThemeLight';

export {ThemeProvider} from '@emotion/react';

export { THEME_DARK } from './src/modules/ui/theme/constants/ThemeDark';
export { THEME_LIGHT } from './src/modules/ui/theme/constants/ThemeLight';

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ThemeType {}
}