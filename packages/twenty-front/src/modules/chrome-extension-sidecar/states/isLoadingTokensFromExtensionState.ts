import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isLoadingTokensFromExtensionState = createStateV2<boolean | null>({
  key: 'isLoadingTokensFromExtensionState',
  defaultValue: null,
});
