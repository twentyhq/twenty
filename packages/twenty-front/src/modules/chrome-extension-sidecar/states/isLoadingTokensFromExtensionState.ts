import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const isLoadingTokensFromExtensionState = createState<boolean | null>({
  key: 'isLoadingTokensFromExtensionState',
  defaultValue: null,
});
