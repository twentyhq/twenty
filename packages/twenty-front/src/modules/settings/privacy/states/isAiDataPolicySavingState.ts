import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isAiDataPolicySavingState = createAtomState<boolean>({
  key: 'isAiDataPolicySavingState',
  defaultValue: false,
});
