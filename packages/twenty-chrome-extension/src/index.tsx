import React from 'react';
import ReactDOM from 'react-dom/client';

import { AppThemeProvider } from '@/ui/theme/components/AppThemeProvider';
import { ThemeType } from '@/ui/theme/constants/ThemeLight';
import App from '~/App';

import '~/index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <AppThemeProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </AppThemeProvider>,
);

declare module '@emotion/react' {
  export interface Theme extends ThemeType {}
}
