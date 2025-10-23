import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

export const buildEnvVar = (
  serverlessFunction: ServerlessFunctionEntity,
  secretEncryptionService: SecretEncryptionService,
) => {
  return (serverlessFunction.application?.applicationVariables ?? []).reduce(
    (acc, v) => {
      const value = String(v.value ?? '');

      acc[v.key] = secretEncryptionService.decrypt(value);

      return acc;
    },
    {} as Record<string, string>,
  );
};
