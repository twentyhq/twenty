import { createState } from 'twenty-ui/utilities';
export const internalHotkeysEnabledScopesState = createState<string[]>({
  key: 'internalHotkeysEnabledScopesState',
  defaultValue: [],
});
