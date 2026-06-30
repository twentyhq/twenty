import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const showHiddenGroupVariablesState = createAtomState<boolean>({
  key: 'showHiddenGroupVariablesState',
  defaultValue: false,
});
