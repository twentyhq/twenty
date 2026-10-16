import { useMediaQuery } from 'twenty-ui/utilities';
import { type ColorScheme } from '@/ui/theme/types/ColorScheme';
import { doNotTranslate } from 'twenty-shared/utils';

export const useSystemColorScheme = (): ColorScheme =>
  useMediaQuery(doNotTranslate('(prefers-color-scheme: dark)'))
    ? doNotTranslate('Dark')
    : doNotTranslate('Light');
