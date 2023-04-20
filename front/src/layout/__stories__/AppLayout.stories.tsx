import { MemoryRouter } from 'react-router-dom';
import AppLayout from '../AppLayout';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../styles/themes';

const component = {
  title: 'AppLayout',
  component: AppLayout,
};

export default component;

export const AppLayoutDefault = () => (
  <ThemeProvider theme={lightTheme}>
    <MemoryRouter>
      <AppLayout>
        <div data-testid="content">Test</div>
      </AppLayout>
    </MemoryRouter>
  </ThemeProvider>
);
