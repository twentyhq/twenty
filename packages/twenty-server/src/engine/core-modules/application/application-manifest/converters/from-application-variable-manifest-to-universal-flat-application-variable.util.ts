import { FieldMetadataType } from 'twenty-shared/types';
import {
  type ApplicationVariableOption,
  type ApplicationVariableType,
} from 'twenty-shared/application';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type UniversalFlatApplicationVariable } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-application-variable.type';

export const fromApplicationVariableManifestToUniversalFlatApplicationVariable =
  ({
    key,
    universalIdentifier,
    description,
    encryptedValue,
    isSecret,
    type,
    options,
    category,
    applicationUniversalIdentifier,
    now,
  }: {
    key: string;
    universalIdentifier: string;
    description?: string;
    encryptedValue: EncryptedString | '';
    isSecret?: boolean;
    type?: ApplicationVariableType;
    options?: ApplicationVariableOption[];
    category?: string;
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
      type: type ?? FieldMetadataType.TEXT,
      options: options ?? null,
      category: category ?? null,
      createdAt: now,
      updatedAt: now,
    };
  };
