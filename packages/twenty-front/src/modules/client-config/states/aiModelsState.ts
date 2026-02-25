import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

export const aiModelsState = createAtomState<ClientAiModelConfig[]>({
  key: 'aiModelsState',
  defaultValue: [],
});
