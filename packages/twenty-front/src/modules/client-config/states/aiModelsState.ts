import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

export const aiModelsState = createStateV2<ClientAiModelConfig[]>({
  key: 'aiModelsState',
  defaultValue: [],
});
