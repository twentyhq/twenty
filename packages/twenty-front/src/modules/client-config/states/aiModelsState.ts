import { createState } from 'twenty-ui/utilities';
import { AiModel } from '~/generated/graphql';

export const aiModelsState = createState<AiModel[]>({
  key: 'aiModelsState',
  defaultValue: [],
});
