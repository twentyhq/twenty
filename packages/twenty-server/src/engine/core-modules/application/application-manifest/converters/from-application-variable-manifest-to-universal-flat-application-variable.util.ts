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
      value: value ?? '',
      description: description ?? '',
      isSecret: isSecret ?? false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  };
