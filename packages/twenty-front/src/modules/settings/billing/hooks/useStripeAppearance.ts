import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';
import { persistedColorSchemeState } from '@/ui/theme/states/persistedColorSchemeState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type Appearance } from '@stripe/stripe-js';
import { THEME_DARK, THEME_LIGHT } from 'twenty-ui/theme';

// Themes the Stripe Elements (rendered in a Stripe-owned iframe) with concrete
// color values from the active Twenty theme. CSS variables can't cross the
// iframe boundary, so the resolved theme object is used instead.
export const useStripeAppearance = (): Appearance => {
  const persistedColorScheme = useAtomStateValue(persistedColorSchemeState);
  const systemColorScheme = useSystemColorScheme();

  const effectiveColorScheme =
    persistedColorScheme === 'System'
      ? systemColorScheme
      : persistedColorScheme;

  const isDark = effectiveColorScheme === 'Dark';
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
