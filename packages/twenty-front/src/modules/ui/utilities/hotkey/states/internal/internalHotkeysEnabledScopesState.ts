import { createState } from '@ui/utilities/state/utils/createState';

export const internalHotkeysEnabledScopesState = createState<string[]>({
  key: 'internalHotkeysEnabledScopesState',
  defaultValue: [],
});
