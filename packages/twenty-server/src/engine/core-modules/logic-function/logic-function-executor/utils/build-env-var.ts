import { isNonEmptyString } from '@sniptt/guards';

import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

export const buildEnvVar = (
  flatApplicationVariables: FlatApplicationVariable[],
  secretEncryptionService: SecretEncryptionService,
): Record<string, string> => {
  return flatApplicationVariables.reduce<Record<string, string>>(
    (acc, flatApplicationVariable) => {
      const value = String(flatApplicationVariable.value ?? '');

      acc[flatApplicationVariable.key] =
        flatApplicationVariable.isSecret && isNonEmptyString(value)
          ? secretEncryptionService.decryptVersioned(
              value as EncryptedString,
              {
                workspaceId: flatApplicationVariable.workspaceId,
              },
            )
          : value;

      return acc;
    },
    {},
  );
};
