import { PipelineStep } from '@/pipeline/types/PipelineStep';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const savedPipelineStepsScopedState = createStateScopeMap<
  PipelineStep[]
>({
  key: 'savedPipelineStepsScopedState',
  defaultValue: [],
});
