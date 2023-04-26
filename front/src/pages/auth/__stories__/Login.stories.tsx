import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';

const component = {
  title: 'Login',
  component: Login,
};

export default component;

export const LoginDefault = () => (
  <ThemeProvider theme={lightTheme}>
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  </ThemeProvider>
);
