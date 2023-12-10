import { atom } from 'recoil';

import { PipelineStep } from '@/pipeline/types/PipelineStep';

export const currentPipelineStepsState = atom<PipelineStep[]>({
  key: 'currentPipelineStepsState',
  default: [],
});
