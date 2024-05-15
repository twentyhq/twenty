import { atom } from 'recoil';

export type ProfilingSessionStatus = 'running' | 'finished' | 'not_started';

export const profilingSessionStatusState = atom<ProfilingSessionStatus>({
  key: 'profilingSessionStatusState',
  default: 'not_started',
});
