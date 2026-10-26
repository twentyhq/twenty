import { FieldMetadataType } from 'twenty-shared/types';
import {
  DEFAULT_APPLICATION_VARIABLE_SCOPE,
  type ApplicationVariableOption,
  type ApplicationVariableScope,
  type ApplicationVariableType,
} from 'twenty-shared/application';

import { type UniversalFlatApplicationVariable } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-application-variable.type';

export const fromApplicationVariableManifestToUniversalFlatApplicationVariable =
  ({
    key,
    universalIdentifier,
    description,
    label,
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
