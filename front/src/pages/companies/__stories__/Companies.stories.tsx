import { MemoryRouter } from 'react-router-dom';
import Companies from '../Companies';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';

const component = {
  title: 'Companies',
  component: Companies,
};

export default component;

export const CompaniesDefault = () => (
  <ThemeProvider theme={lightTheme}>
    <MemoryRouter>
      <Companies />
    </MemoryRouter>
  </ThemeProvider>
);
