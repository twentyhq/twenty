import { isWorkspaceAccentColor } from 'twenty-shared/workspace';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const persistedWorkspaceAccentColorState = createAtomState<
  string | null
>({
  key: 'persistedWorkspaceAccentColorState',
  defaultValue: null,
  useLocalStorage: true,
  validateInitFn: (accentColor) => isWorkspaceAccentColor(accentColor),
});
