import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type ProfilingQueue = {
  [runName: string]: string[];
};

export const profilingQueueState = createAtomState<ProfilingQueue>({
  key: 'profilingQueueState',
  defaultValue: {},
});
