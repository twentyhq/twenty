import { PipelineStep } from '@/pipeline/types/PipelineStep';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const savedPipelineStepsScopedState = createScopedState<PipelineStep[]>({
  key: 'savedPipelineStepsScopedState',
  defaultValue: [],
});
