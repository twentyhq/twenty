import CompanyChip from '../CompanyChip';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';

export default {
  title: 'CompanyChip',
  component: CompanyChip,
};

export const RegularCompanyChip = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <CompanyChip name="selected-company-1" />
    </ThemeProvider>
  );
};

export const RegularCompanyChipWithImage = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <CompanyChip name="selected-company-1" picture="coucou.fr" />
    </ThemeProvider>
  );
};
