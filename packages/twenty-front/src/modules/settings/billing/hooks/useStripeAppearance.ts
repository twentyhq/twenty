import { type Appearance } from '@stripe/stripe-js';
import { useContext } from 'react';
import { THEME_DARK, THEME_LIGHT } from 'twenty-ui/theme';
import { ThemeContext } from 'twenty-ui/theme-constants';

export const useStripeAppearance = (): Appearance => {
  const { colorScheme } = useContext(ThemeContext);
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  return {
    theme: isDark ? 'night' : 'stripe',
    variables: {
      colorPrimary: theme.color.blue,
      colorBackground: theme.background.primary,
      colorText: theme.font.color.primary,
      colorDanger: theme.font.color.danger,
      borderRadius: '8px',
    },
  };
};
