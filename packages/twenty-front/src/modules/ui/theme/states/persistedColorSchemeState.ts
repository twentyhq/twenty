import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ColorScheme } from '@/ui/theme/types/ColorScheme';

export const persistedColorSchemeState = createAtomState<ColorScheme>({
  key: 'persistedColorSchemeState',
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is a persisted appearance preference identifier.
  defaultValue: 'System',
  useLocalStorage: true,
});
