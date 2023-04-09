import { MemoryRouter } from 'react-router-dom';
import Companies from '../Companies';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';
import AppLayout from '../../../layout/AppLayout';

export default {
  title: 'Companies',
  component: Companies,
};

export const CompaniesDefault = () => (
  <ThemeProvider theme={lightTheme}>
    <MemoryRouter>
      <Companies />
    </MemoryRouter>
  </ThemeProvider>
);
