import React from 'react';
import ReactDOM from 'react-dom/client';

import { AppThemeProvider } from '@/ui/theme/components/AppThemeProvider';
import { ThemeType } from '@/ui/theme/constants/ThemeLight';
import PageInaccessible from '~/options/PageInaccessible';

import '~/index.css';

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <AppThemeProvider>
    <React.StrictMode>
      <PageInaccessible />
    </React.StrictMode>
  </AppThemeProvider>,
);

declare module '@emotion/react' {
  export interface Theme extends ThemeType {}
}
