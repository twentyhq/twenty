import { useMediaQuery } from 'twenty-ui/utilities';
import { type ColorScheme } from '@/ui/theme/types/ColorScheme';

export const useSystemColorScheme = (): ColorScheme =>
  useMediaQuery('(prefers-color-scheme: dark)') ? 'Dark' : 'Light';
