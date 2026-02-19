import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { createStateWithLocalStorageV2 } from '@/ui/utilities/state/jotai/utils/createStateWithLocalStorageV2';

export const persistedColorSchemeState =
  createStateWithLocalStorageV2<ColorScheme>({
    key: 'persistedColorSchemeState',
    defaultValue: 'System',
  });
