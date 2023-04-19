import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';
import PersonChip from '../PersonChip';

export default {
  title: 'PersonChip',
  component: PersonChip,
};

export const RegularPersonChip = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <PersonChip name="selected-company-1" />
    </ThemeProvider>
  );
};

export const RegularPersonChipWithImage = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <PersonChip name="selected-company-1" picture="coucou.fr" />
    </ThemeProvider>
  );
};
