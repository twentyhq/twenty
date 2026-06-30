import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type ProfilingSessionStatus = 'running' | 'finished' | 'not_started';

export const profilingSessionStatusState =
  createAtomState<ProfilingSessionStatus>({
    key: 'profilingSessionStatusState',
    defaultValue: 'not_started',
  });
