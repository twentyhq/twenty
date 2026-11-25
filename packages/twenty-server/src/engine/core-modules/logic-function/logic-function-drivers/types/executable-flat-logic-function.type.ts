import { type NON_PERSISTED_EXECUTOR_NAME_PREFIXES } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/non-persisted-executor-name-prefixes';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export type NonPersistedExecutorNamePrefix =
  (typeof NON_PERSISTED_EXECUTOR_NAME_PREFIXES)[keyof typeof NON_PERSISTED_EXECUTOR_NAME_PREFIXES];

export type ExecutableFlatLogicFunction = FlatLogicFunction & {
  executorNamePrefix?: NonPersistedExecutorNamePrefix;
};
