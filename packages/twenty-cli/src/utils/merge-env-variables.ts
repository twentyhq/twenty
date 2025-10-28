import { ApplicationVariableManifest } from '../types/config.types';

export const mergeEnvVariables = ({
  envVariablesFromDecorators,
  envVariablesFromDotEnv,
}: {
  envVariablesFromDecorators: ApplicationVariableManifest[];
  envVariablesFromDotEnv: Record<string, string>;
}): ApplicationVariableManifest[] => {
  return [...envVariablesFromDecorators].map((envVariable) => {
    if (envVariablesFromDotEnv[envVariable.key]) {
      return { ...envVariable, value: envVariablesFromDotEnv[envVariable.key] };
    }
    return envVariable;
  });
};
