import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './Options';
import '../index.css';
import { AppThemeProvider } from './modules/ui/theme/components/AppThemeProvider';
import { ThemeType } from './modules/ui/theme/constants/theme';

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <AppThemeProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </AppThemeProvider>,
);

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ThemeType {}
}
