import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isLoadingTokensFromExtensionState = createAtomState<
  boolean | null
>({
  key: 'isLoadingTokensFromExtensionState',
  defaultValue: null,
});
