import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const profilingSessionRunsState = createAtomState<string[]>({
  key: 'profilingSessionRunsState',
  defaultValue: [],
});
