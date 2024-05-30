import { createState } from 'twenty-ui';

export const isLoadingTokensFromExtensionState = createState<boolean | null>({
  key: 'isLoadingTokensFromExtensionState',
  defaultValue: null,
});
