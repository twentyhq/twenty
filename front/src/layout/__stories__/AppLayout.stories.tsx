import { MemoryRouter } from 'react-router-dom';
import AppLayout from '../AppLayout';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../styles/themes';

export default {
  title: 'AppLayout',
  component: AppLayout,
};

export const AppLayoutDefault = () => (
  <ThemeProvider theme={lightTheme}>
    <MemoryRouter>
      <AppLayout>
        <div data-testid="content">Test</div>
      </AppLayout>
    </MemoryRouter>
  </ThemeProvider>
);
