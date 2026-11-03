import { type ApplicationManifest } from 'twenty-shared/application';

import { isReservedEnvVariableName } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/is-reserved-env-variable-name.util';

export const findReservedVariableNamesInApplicationManifest = ({
  serverVariables,
  applicationVariables,
}: Pick<
  ApplicationManifest,
  'serverVariables' | 'applicationVariables'
>): string[] => [
  ...new Set(
    [
      ...Object.keys(serverVariables ?? {}),
      ...Object.keys(applicationVariables ?? {}),
    ].filter(isReservedEnvVariableName),
  ),
];
