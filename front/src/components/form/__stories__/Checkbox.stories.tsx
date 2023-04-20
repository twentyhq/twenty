import Checkbox from '../Checkbox';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';

const component = {
  title: 'Checkbox',
  component: Checkbox,
};

export default component;

export const RegularCheckbox = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <Checkbox name="selected-company-1" id="selected-company--1" />
    </ThemeProvider>
  );
};
