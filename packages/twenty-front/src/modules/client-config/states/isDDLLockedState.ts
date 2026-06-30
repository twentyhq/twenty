import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isDDLLockedState = createAtomState<boolean>({
  key: 'isDDLLocked',
  defaultValue: false,
});
