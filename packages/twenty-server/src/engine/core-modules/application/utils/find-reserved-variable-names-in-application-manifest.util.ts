import { type ApplicationManifest } from 'twenty-shared/application';

import { findEngineInjectedEnvVariableNames } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/find-engine-injected-env-variable-names.util';

export const findReservedVariableNamesInApplicationManifest = ({
  serverVariables,
  applicationVariables,
}: Pick<
  ApplicationManifest,
  'serverVariables' | 'applicationVariables'
>): string[] => [
  ...new Set(
    findEngineInjectedEnvVariableNames([
      ...Object.keys(serverVariables ?? {}),
      ...Object.keys(applicationVariables ?? {}),
    ]),
  ),
];
