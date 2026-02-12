import { createState } from 'twenty-ui/utilities';
import { type FindManyLogicFunctionsQuery } from '~/generated-metadata/graphql';

export type LogicFunction =
  FindManyLogicFunctionsQuery['findManyLogicFunctions'][number];

export const logicFunctionsState = createState<LogicFunction[]>({
  key: 'logicFunctionsState',
  defaultValue: [],
});
