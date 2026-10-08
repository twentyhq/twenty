import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ClientAiEvaluationModelConfig } from '~/generated-metadata/graphql';

export const aiEvaluationModelsState = createAtomState<
  ClientAiEvaluationModelConfig[]
>({
  key: 'aiEvaluationModelsState',
  defaultValue: [],
});
