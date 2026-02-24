import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const persistedColorSchemeState = createState<ColorScheme>({
  key: 'persistedColorSchemeState',
  defaultValue: 'System',
  useLocalStorage: true,
});
