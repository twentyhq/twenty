import React from 'react';
import ReactDOM from 'react-dom/client';

import { AppThemeProvider } from '@/ui/theme/components/AppThemeProvider';
import { ThemeType } from '@/ui/theme/constants/ThemeLight';
import App from '~/options/App';

import '~/index.css';

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <AppThemeProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </AppThemeProvider>,
);

declare module '@emotion/react' {
  export interface Theme extends ThemeType {}
}
