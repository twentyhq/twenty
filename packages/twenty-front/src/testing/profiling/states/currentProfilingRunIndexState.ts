import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const currentProfilingRunIndexState = createAtomState<number>({
  key: 'currentProfilingRunIndexState',
  defaultValue: 0,
});
