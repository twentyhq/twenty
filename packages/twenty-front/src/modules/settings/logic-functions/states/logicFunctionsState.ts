import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { type FindManyLogicFunctionsQuery } from '~/generated-metadata/graphql';

export type LogicFunction =
  FindManyLogicFunctionsQuery['findManyLogicFunctions'][number];

export const logicFunctionsState = createStateV2<LogicFunction[]>({
  key: 'logicFunctionsState',
  defaultValue: [],
});
