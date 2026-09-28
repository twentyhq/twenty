import { type Appearance } from '@stripe/stripe-js';
import { isDefined } from 'twenty-shared/utils';
import { THEME_DARK, THEME_LIGHT, useThemeColorScheme } from 'twenty-ui/theme';

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

  // The three channel groups are mandatory in the pattern, only alpha is optional
  const [, red = '0', green = '0', blue = '0', alpha] = match;
  const toByte = (value: string) => Math.round(Number(value) * 255);
  const rgb = `${toByte(red)}, ${toByte(green)}, ${toByte(blue)}`;

  // oxlint-disable-next-line twenty/no-hardcoded-colors
  return isDefined(alpha) ? `rgba(${rgb}, ${alpha})` : `rgb(${rgb})`;
};

export const useStripeAppearance = (): Appearance => {
  const colorScheme = useThemeColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME_DARK : THEME_LIGHT;

  return {
    theme: isDark ? 'night' : 'stripe',
    variables: {
      fontFamily: theme.font.family,
      fontSizeBase: '13px',
      colorPrimary: toStripeColor(theme.color.blue),
      colorBackground: toStripeColor(theme.background.primary),
      colorText: toStripeColor(theme.font.color.primary),
      colorTextSecondary: toStripeColor(theme.font.color.tertiary),
      colorTextPlaceholder: toStripeColor(theme.font.color.light),
      colorDanger: toStripeColor(theme.font.color.danger),
      colorIcon: toStripeColor(theme.font.color.tertiary),
      borderRadius: theme.border.radius.md,
      spacingGridRow: '16px',
      spacingGridColumn: '8px',
    },
    rules: {
      '.Label': {
        color: toStripeColor(theme.font.color.light),
        fontWeight: String(theme.font.weight.semiBold),
        fontSize: '11px',
        marginBottom: '4px',
      },
      '.Input': {
        backgroundColor: toStripeColor(theme.background.transparent.lighter),
        border: `1px solid ${toStripeColor(theme.border.color.medium)}`,
        boxShadow: 'none',
        fontSize: '13px',
        lineHeight: '16px',
        padding: '7px 8px',
      },
      '.Input:focus': {
        border: `1px solid ${toStripeColor(theme.color.blue)}`,
        boxShadow: 'none',
      },
      '.Input--invalid': {
        border: `1px solid ${toStripeColor(theme.border.color.danger)}`,
        boxShadow: 'none',
      },
      '.Input::placeholder': {
        color: toStripeColor(theme.font.color.light),
      },
    },
  };
};
