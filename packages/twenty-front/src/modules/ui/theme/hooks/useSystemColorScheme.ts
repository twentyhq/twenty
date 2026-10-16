import { useMediaQuery } from 'twenty-ui/utilities';
import { type ColorScheme } from '@/ui/theme/types/ColorScheme';

export const useSystemColorScheme = (): ColorScheme =>
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- The media query and color-scheme values are API identifiers.
  useMediaQuery('(prefers-color-scheme: dark)') ? 'Dark' : 'Light';
