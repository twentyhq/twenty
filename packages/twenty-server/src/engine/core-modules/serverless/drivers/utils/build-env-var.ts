import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

export const buildEnvVar = (serverlessFunction: ServerlessFunctionEntity) => {
  return (serverlessFunction.application?.applicationVariables ?? []).reduce(
    (acc, v) => {
      acc[v.key] = String(v.value ?? '');

      return acc;
    },
    {} as Record<string, string>,
  );
};
