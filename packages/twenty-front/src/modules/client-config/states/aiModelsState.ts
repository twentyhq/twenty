import { createState } from 'twenty-ui/utilities';
import { ClientAiModelConfig } from '~/generated/graphql';

export const aiModelsState = createState<ClientAiModelConfig[]>({
  key: 'aiModelsState',
  defaultValue: [],
});
