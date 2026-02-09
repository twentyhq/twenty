import { type FlatApplicationVariable } from 'src/engine/core-modules/applicationVariable/types/flat-application-variable.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

export const buildEnvVar = (
  flatApplicationVariables: FlatApplicationVariable[],
  secretEncryptionService: SecretEncryptionService,
): Record<string, string> => {
  return flatApplicationVariables.reduce<Record<string, string>>(
    (acc, flatApplicationVariable) => {
      const value = String(flatApplicationVariable.value ?? '');

      acc[flatApplicationVariable.key] = flatApplicationVariable.isSecret
        ? secretEncryptionService.decrypt(value)
        : value;

      return acc;
    },
    {},
  );
};
