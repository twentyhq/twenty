import { createState } from 'twenty-ui/utilities';
import { type GetManyLogicFunctionsQuery } from '~/generated-metadata/graphql';

export type LogicFunction =
  GetManyLogicFunctionsQuery['findManyLogicFunctions'][number];

export const logicFunctionsState = createState<LogicFunction[]>({
  key: 'logicFunctionsState',
  defaultValue: [],
});
