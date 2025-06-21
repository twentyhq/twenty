import { createState } from 'twenty-ui/utilities';
import { AiModelConfig } from '~/generated/graphql';

export const aiModelsState = createState<AiModelConfig[]>({
  key: 'aiModelsState',
  defaultValue: [],
});
