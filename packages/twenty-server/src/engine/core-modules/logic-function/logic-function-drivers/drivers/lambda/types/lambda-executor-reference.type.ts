import { type ExecutableFlatLogicFunction } from 'src/engine/core-modules/logic-function/logic-function-drivers/types/executable-flat-logic-function.type';

export type LambdaExecutorReference = Pick<
  ExecutableFlatLogicFunction,
  'id' | 'executorNamePrefix'
>;
