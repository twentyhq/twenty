import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type UniversalFlatApplicationVariable } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-application-variable.type';

export const fromApplicationVariableManifestToUniversalFlatApplicationVariable =
  ({
    key,
    universalIdentifier,
    description,
    value,
    isSecret,
    applicationUniversalIdentifier,
    now,
  }: {
    key: string;
    universalIdentifier: string;
    description?: string;
    value?: string;
    isSecret?: boolean;
    applicationUniversalIdentifier: string;
    now: string;
  }): UniversalFlatApplicationVariable => {
    return {
      universalIdentifier,
      applicationUniversalIdentifier,
      key,
      // Manifest values are not compared (toCompare: false) — cast is safe
      value: (isSecret ? '' : (value ?? '')) as EncryptedString | '',
      description: description ?? '',
      isSecret: isSecret ?? false,
      createdAt: now,
      updatedAt: now,
    };
  };
