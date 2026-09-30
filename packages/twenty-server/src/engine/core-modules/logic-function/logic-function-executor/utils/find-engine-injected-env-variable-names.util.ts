import { ENGINE_INJECTED_ENV_VARIABLE_NAMES } from 'src/engine/core-modules/logic-function/logic-function-executor/constants/engine-injected-env-variable-names.constant';

export const findEngineInjectedEnvVariableNames = (keys: string[]): string[] =>
  keys.filter((key) => ENGINE_INJECTED_ENV_VARIABLE_NAMES.has(key));
