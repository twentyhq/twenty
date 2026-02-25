import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type FindManyLogicFunctionsQuery } from '~/generated-metadata/graphql';

export type LogicFunction =
  FindManyLogicFunctionsQuery['findManyLogicFunctions'][number];

export const logicFunctionsState = createAtomState<LogicFunction[]>({
  key: 'logicFunctionsState',
  defaultValue: [],
});
