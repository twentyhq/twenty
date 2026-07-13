import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ColorScheme } from 'twenty-ui/input';

export const persistedColorSchemeState = createAtomState<ColorScheme>({
  key: 'persistedColorSchemeState',
  defaultValue: 'System',
  useLocalStorage: true,
});
