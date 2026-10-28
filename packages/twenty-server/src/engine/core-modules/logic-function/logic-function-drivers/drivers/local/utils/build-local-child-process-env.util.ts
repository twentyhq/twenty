import { isDefined } from 'twenty-shared/utils';

import { LOCAL_CHILD_PROCESS_INHERITED_ENV_VARIABLE_NAMES } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/constants/local-driver.constant';

export const buildLocalChildProcessEnv = ({
  hostEnv,
  functionEnv,
  temporaryDirectory,
}: {
  hostEnv: NodeJS.ProcessEnv;
  functionEnv: Record<string, string>;
  temporaryDirectory: string;
}): Record<string, string> => {
  const inheritedEnv: Record<string, string> = {};

  for (const name of LOCAL_CHILD_PROCESS_INHERITED_ENV_VARIABLE_NAMES) {
    const value = hostEnv[name];

    if (isDefined(value)) {
      inheritedEnv[name] = value;
    }
  }

  // NODE_OPTIONS could load the server's tsx loader into the handler process.
  const { NODE_OPTIONS: _nodeOptions, ...functionEnvWithoutNodeOptions } =
    functionEnv;

  return {
    ...inheritedEnv,
    ...functionEnvWithoutNodeOptions,
    TMPDIR: temporaryDirectory,
  };
};
