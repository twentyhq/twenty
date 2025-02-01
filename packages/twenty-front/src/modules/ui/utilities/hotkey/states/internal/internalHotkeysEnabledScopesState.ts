import { createState } from "twenty-shared";

export const internalHotkeysEnabledScopesState = createState<string[]>({
  key: 'internalHotkeysEnabledScopesState',
  defaultValue: [],
});
