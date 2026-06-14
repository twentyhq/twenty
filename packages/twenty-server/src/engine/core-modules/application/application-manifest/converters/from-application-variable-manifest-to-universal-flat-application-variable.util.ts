import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type UniversalFlatApplicationVariable } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-application-variable.type';

export const fromApplicationVariableManifestToUniversalFlatApplicationVariable =
  ({
    key,
    universalIdentifier,
    description,
    encryptedValue,
    isSecret,
    applicationUniversalIdentifier,
    now,
  }: {
    key: string;
    universalIdentifier: string;
    description?: string;
    encryptedValue: EncryptedString | '';
    isSecret?: boolean;
    applicationUniversalIdentifier: string;
    now: string;
  }): UniversalFlatApplicationVariable => {
    return {
      universalIdentifier,
      applicationUniversalIdentifier,
      key,
      value: encryptedValue,
      description: description ?? '',
      isSecret: isSecret ?? false,
      createdAt: now,
      updatedAt: now,
    };
  };
