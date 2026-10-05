import { FieldMetadataType } from 'twenty-shared/types';
import {
  DEFAULT_APPLICATION_VARIABLE_SCOPE,
  type ApplicationVariableOption,
  type ApplicationVariableScope,
  type ApplicationVariableType,
} from 'twenty-shared/application';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type UniversalFlatApplicationVariable } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-application-variable.type';

export const fromApplicationVariableManifestToUniversalFlatApplicationVariable =
  ({
    key,
    universalIdentifier,
    description,
    label,
    encryptedValue,
    defaultValue,
    isSecret,
    isDeprecated,
    isRequired,
    type,
    options,
    scope,
    applicationUniversalIdentifier,
    now,
  }: {
    key: string;
    universalIdentifier: string;
    description?: string;
    label?: string;
    encryptedValue: EncryptedString | null;
    defaultValue: string | null;
    isSecret?: boolean;
    isDeprecated?: boolean;
    isRequired?: boolean;
    type?: ApplicationVariableType;
    options?: ApplicationVariableOption[];
    scope?: ApplicationVariableScope;
    applicationUniversalIdentifier: string;
    now: string;
  }): UniversalFlatApplicationVariable => {
    return {
      universalIdentifier,
      applicationUniversalIdentifier,
      key,
      value: encryptedValue,
      description: description ?? '',
      label: label ?? '',
      isSecret: isSecret ?? false,
      isDeprecated: isDeprecated ?? false,
      isRequired: (isDeprecated ?? false) ? false : (isRequired ?? false),
      type: type ?? FieldMetadataType.TEXT,
      options: options ?? null,
      scope: scope ?? DEFAULT_APPLICATION_VARIABLE_SCOPE,
      defaultValue,
      createdAt: now,
      updatedAt: now,
    };
  };
