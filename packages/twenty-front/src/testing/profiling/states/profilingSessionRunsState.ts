import { atom } from 'recoil';

export const profilingSessionRunsState = atom<string[]>({
  key: 'profilingSessionRunsState',
  default: [],
});
