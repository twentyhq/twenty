import { ENGINE_INJECTED_ENV_VARIABLE_NAMES } from 'src/engine/core-modules/logic-function/logic-function-executor/constants/engine-injected-env-variable-names.constant';
import { RESERVED_ENV_VARIABLE_NAME_PREFIX } from 'src/engine/core-modules/logic-function/logic-function-executor/constants/reserved-env-variable-name-prefix.constant';

export const isReservedEnvVariableName = (name: string): boolean =>
  ENGINE_INJECTED_ENV_VARIABLE_NAMES.has(name) ||
  name.startsWith(RESERVED_ENV_VARIABLE_NAME_PREFIX);
