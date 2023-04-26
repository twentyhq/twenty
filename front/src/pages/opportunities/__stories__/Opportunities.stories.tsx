import { MemoryRouter } from 'react-router-dom';
import Opportunities from '../Opportunities';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';

const component = {
  title: 'Opportunities',
  component: Opportunities,
};

export default component;

export const OpportunitiesDefault = () => (
  <ThemeProvider theme={lightTheme}>
    <MemoryRouter>
      <Opportunities />
    </MemoryRouter>
  </ThemeProvider>
);
