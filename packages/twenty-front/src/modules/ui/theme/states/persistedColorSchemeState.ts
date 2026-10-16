import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ColorScheme } from '@/ui/theme/types/ColorScheme';
import { doNotTranslate } from 'twenty-shared/utils';

export const persistedColorSchemeState = createAtomState<ColorScheme>({
  key: 'persistedColorSchemeState',
  defaultValue: doNotTranslate('System'),
  useLocalStorage: true,
});
