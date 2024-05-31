import { atom } from 'recoil';

export type ProfilingQueue = {
  [runName: string]: string[];
};

export const profilingQueueState = atom<ProfilingQueue>({
  key: 'profilingQueueState',
  default: {},
});
