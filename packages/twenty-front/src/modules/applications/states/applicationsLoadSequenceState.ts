import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const applicationsLoadSequenceState = createAtomState<number>({
  key: 'applicationsLoadSequenceState',
  defaultValue: 0,
});
