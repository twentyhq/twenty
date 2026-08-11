import type { DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type FrontComponentSharedDependenciesConfig } from '@/sdk/define/front-component-shared-dependencies/front-component-shared-dependencies-config';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from 'twenty-shared/application';

const RESERVED_DEPENDENCY_PREFIXES = ['twenty-client-sdk', 'twenty-sdk'];

export const defineFrontComponentSharedDependencies: DefineEntity<
  FrontComponentSharedDependenciesConfig
> = (config) => {
  const errors = [];

  if (!isNonEmptyArray(config.dependencies)) {
    errors.push('Shared dependencies must declare at least one dependency');
  } else {
    const seenDependencies = new Set<string>();

    for (const dependency of config.dependencies) {
      if (!isNonEmptyString(dependency)) {
        errors.push('Shared dependencies must be non-empty strings');
        continue;
      }

      if (dependency.startsWith('.') || dependency.startsWith('/')) {
        errors.push(
          `Shared dependency "${dependency}" must be a package specifier, not a relative or absolute path`,
        );
        continue;
      }

      if (dependency === SHARED_DEPENDENCIES_IMPORT_SPECIFIER) {
        errors.push(
          `Shared dependency "${dependency}" is reserved and cannot be shared`,
        );
        continue;
      }

      if (
        RESERVED_DEPENDENCY_PREFIXES.some(
          (prefix) =>
            dependency === prefix || dependency.startsWith(`${prefix}/`),
        )
      ) {
        errors.push(
          `Shared dependency "${dependency}" is already served separately and cannot be shared`,
        );
        continue;
      }

      if (seenDependencies.has(dependency)) {
        errors.push(`Shared dependency "${dependency}" is declared twice`);
        continue;
      }

      seenDependencies.add(dependency);
    }
  }

  return createValidationResult({
    config,
    errors,
  });
};
