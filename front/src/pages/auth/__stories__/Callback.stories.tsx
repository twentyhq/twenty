import { MemoryRouter } from 'react-router-dom';
import Callback from '../Callback';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';

const component = {
  title: 'Callback',
  component: Callback,
};

export default component;

export const CallbackDefault = () => (
  <ThemeProvider theme={lightTheme}>
    <MemoryRouter>
      <Callback />
    </MemoryRouter>
  </ThemeProvider>
);
