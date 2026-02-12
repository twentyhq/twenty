import { createState } from '@/ui/utilities/state/utils/createState';
import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

export const aiModelsState = createState<ClientAiModelConfig[]>({
  key: 'aiModelsState',
  defaultValue: [],
});
