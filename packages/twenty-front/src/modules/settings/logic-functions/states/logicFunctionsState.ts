import { createState } from '@/ui/utilities/state/utils/createState';
import { type FindManyLogicFunctionsQuery } from '~/generated-metadata/graphql';

export type LogicFunction =
  FindManyLogicFunctionsQuery['findManyLogicFunctions'][number];

export const logicFunctionsState = createState<LogicFunction[]>({
  key: 'logicFunctionsState',
  defaultValue: [],
});
