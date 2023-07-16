import { atomFamily } from 'recoil';

export const pipelineProgressIdScopedState = atomFamily<string | null, string>({
  key: 'pipelineProgressIdScopedState',
  default: null,
});
