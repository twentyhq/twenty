import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const persistedColorSchemeState = createStateV2<ColorScheme>({
  key: 'persistedColorSchemeState',
  defaultValue: 'System',
  useLocalStorage: true,
});
