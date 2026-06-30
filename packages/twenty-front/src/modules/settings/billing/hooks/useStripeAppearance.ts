import { type Appearance } from '@stripe/stripe-js';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { THEME_DARK, THEME_LIGHT } from 'twenty-ui/theme';
import { ThemeContext } from 'twenty-ui/theme-constants';

// Stripe's Appearance API rejects CSS color(display-p3 ...) values, which is
// how the Twenty theme stores colors; map them to sRGB so the PaymentElement
// is themed instead of silently falling back to Stripe defaults.
const toStripeColor = (color: string): string => {
  const match = color.match(
    /^color\(display-p3\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/,
  );

  if (!isDefined(match)) {
    return color;
  }

  const [, red, green, blue, alpha] = match;
  const toByte = (value: string) => Math.round(Number(value) * 255);
  const rgb = `${toByte(red)}, ${toByte(green)}, ${toByte(blue)}`;

  // oxlint-disable-next-line twenty/no-hardcoded-colors
  return isDefined(alpha) ? `rgba(${rgb}, ${alpha})` : `rgb(${rgb})`;
};

export const useStripeAppearance = (): Appearance => {
  const { colorScheme } = useContext(ThemeContext);
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  return {
    theme: isDark ? 'night' : 'stripe',
    variables: {
      colorPrimary: toStripeColor(theme.color.blue),
      colorBackground: toStripeColor(theme.background.primary),
      colorText: toStripeColor(theme.font.color.primary),
      colorDanger: toStripeColor(theme.font.color.danger),
      borderRadius: '8px',
    },
  };
};
