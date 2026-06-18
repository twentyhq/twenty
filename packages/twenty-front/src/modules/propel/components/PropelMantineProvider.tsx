import '@mantine/core/styles.css';

import {
  createTheme,
  type CSSVariablesResolver,
  MantineProvider,
} from '@mantine/core';
import { type ReactNode, useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

// Twenty has NO global MantineProvider and does NOT import @mantine/core/styles.css
// anywhere, so the Propel hero owns its own Mantine scope. We import the stylesheet
// here (once, at the page boundary) and wrap the whole page in this provider.
//
// The provider tracks Twenty's light/dark via `forceColorScheme` (read off
// ThemeContext) and bridges a handful of Twenty design tokens (the stable
// `var(--t-*)` strings from themeCssVariables) into Mantine's CSS variables so
// Mantine surfaces, borders, and text colors match the surrounding CRM exactly.

const propelMantineTheme = createTheme({
  fontFamily: 'Inter, sans-serif',
  primaryColor: 'red',
  defaultRadius: 'md',
  // Dropdowns must paint ABOVE Twenty's drawers/modals. The hero composer lives in
  // a Twenty RightDrawer at z-index 1001, but Mantine's default dropdown z-index is
  // 300 — so without this every Select/Combobox dropdown opens BEHIND the drawer and
  // looks dead (the social composer's tone, image-aspect, and listing selects all hit
  // this). 5000 clears Twenty's drawer/modal layers while staying below the floating
  // dialer dock (~10002). Set on every dropdown-bearing component so any future Select
  // inside a drawer/modal just works.
  components: {
    Combobox: { defaultProps: { zIndex: 5000 } },
    Select: { defaultProps: { comboboxProps: { zIndex: 5000 } } },
    MultiSelect: { defaultProps: { comboboxProps: { zIndex: 5000 } } },
    Autocomplete: { defaultProps: { comboboxProps: { zIndex: 5000 } } },
    Popover: { defaultProps: { zIndex: 5000 } },
    Menu: { defaultProps: { zIndex: 5000 } },
  },
  other: {
    // Twenty tokens, referenced as CSS variables so they re-resolve per scheme
    // (the var() indirection means we don't have to branch light/dark ourselves).
    backgroundPrimary: themeCssVariables.background.primary,
    backgroundSecondary: themeCssVariables.background.secondary,
    backgroundTertiary: themeCssVariables.background.tertiary,
    borderMedium: themeCssVariables.border.color.medium,
    borderLight: themeCssVariables.border.color.light,
    fontColorPrimary: themeCssVariables.font.color.primary,
    fontColorSecondary: themeCssVariables.font.color.secondary,
    fontColorTertiary: themeCssVariables.font.color.tertiary,
  },
});

// Map Twenty's surface/text tokens onto Mantine's core CSS variables so default
// Mantine components (Card, Paper, Text) read the CRM palette without per-component
// styling. Scheme-agnostic because the underlying `var(--t-*)` already swaps with
// Twenty's `.light` / `.dark` root class.
const propelCssVariablesResolver: CSSVariablesResolver = (theme) => ({
  variables: {
    '--mantine-color-body': theme.other.backgroundPrimary,
    '--mantine-color-text': theme.other.fontColorPrimary,
    '--mantine-color-dimmed': theme.other.fontColorTertiary,
    '--mantine-color-default-border': theme.other.borderMedium,
  },
  light: {},
  dark: {},
});

export const PropelMantineProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { colorScheme } = useContext(ThemeContext);

  return (
    <MantineProvider
      theme={propelMantineTheme}
      forceColorScheme={colorScheme}
      cssVariablesResolver={propelCssVariablesResolver}
    >
      {children}
    </MantineProvider>
  );
};
