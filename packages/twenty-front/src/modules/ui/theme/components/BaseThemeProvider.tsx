import { type JSX, createContext } from 'react';

// Salesfarce: remove with the theme
import { SalesfarceTheme } from '@/salesfarce/components/SalesfarceTheme';
import { salesfarceIsActiveState } from '@/salesfarce/states/salesfarceIsActiveState';
import { UI_SCALE_MULTIPLIERS } from '@/ui/theme/constants/UiScaleMultipliers';
import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';
import { persistedColorSchemeState } from '@/ui/theme/states/persistedColorSchemeState';
import { persistedUiScaleStepState } from '@/ui/theme/states/persistedUiScaleStepState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ThemeProvider } from 'twenty-ui/theme';
import { type ColorScheme } from '@/ui/theme/types/ColorScheme';

type BaseThemeProviderProps = {
  children: JSX.Element | JSX.Element[];
};

export const ThemeSchemeContext = createContext<(theme: ColorScheme) => void>(
  () => {},
);

export const BaseThemeProvider = ({ children }: BaseThemeProviderProps) => {
  const [persistedColorScheme, setPersistedColorScheme] = useAtomState(
    persistedColorSchemeState,
  );
  const persistedUiScaleStep = useAtomStateValue(persistedUiScaleStepState);
  // Salesfarce: remove with the theme
  const salesfarceIsActive = useAtomStateValue(salesfarceIsActiveState);
  const systemColorScheme = useSystemColorScheme();
  const effectiveColorScheme =
    persistedColorScheme === 'System'
      ? systemColorScheme
      : persistedColorScheme;

  return (
    <ThemeSchemeContext.Provider value={setPersistedColorScheme}>
      {/* Salesfarce: remove with the theme */}
      <SalesfarceTheme isActive={salesfarceIsActive} />
      <ThemeProvider
        // Salesfarce: on removal, drop "&& !salesfarceIsActive"
        colorScheme={
          effectiveColorScheme === 'Dark' && !salesfarceIsActive
            ? 'dark'
            : 'light'
        }
        scale={UI_SCALE_MULTIPLIERS[persistedUiScaleStep]}
      >
        {children}
      </ThemeProvider>
    </ThemeSchemeContext.Provider>
  );
};
