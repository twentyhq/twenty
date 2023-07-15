import { atomFamily } from 'recoil';

export const pipelineStageIdScopedState = atomFamily<string | null, string>({
  key: 'pipelineStageIdScopedState',
  default: null,
});
