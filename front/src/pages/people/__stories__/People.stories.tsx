import { MemoryRouter } from 'react-router-dom';
import People from '../People';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';

const component = {
  title: 'People',
  component: People,
};

export default component;

export const PeopleDefault = () => (
  <ThemeProvider theme={lightTheme}>
    <MemoryRouter>
      <People />
    </MemoryRouter>
  </ThemeProvider>
);
