import { MemoryRouter } from 'react-router-dom';

import Checkbox from '../Checkbox';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';

export default {
  title: 'Checkbox',
  component: Checkbox,
};

export const RegularCheckbox = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter initialEntries={['/companies']}>
        <Checkbox name="selected-company-1" id="selected-company--1" />
      </MemoryRouter>
    </ThemeProvider>
  );
};
