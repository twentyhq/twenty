import { type FlatApplicationVariable } from 'src/engine/core-modules/applicationVariable/types/flat-application-variable.type';

export const buildEnvVar = (
  flatApplicationVariables: FlatApplicationVariable[],
): Record<string, string> => {
  return flatApplicationVariables.reduce<Record<string, string>>(
    (acc, flatApplicationVariable) => {
      acc[flatApplicationVariable.key] = flatApplicationVariable.value;

      return acc;
    },
    {},
  );
};
