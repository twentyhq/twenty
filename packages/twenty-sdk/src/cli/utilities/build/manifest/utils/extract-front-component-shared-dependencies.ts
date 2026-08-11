import { normalizeSharedDependencies } from '@/cli/utilities/build/manifest/utils/normalize-shared-dependencies';
import { pathExists, readJson } from '@/cli/utilities/file/fs-utils';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import path from 'path';
import {
  FRONT_COMPONENT_SHARED_DEPENDENCIES_BUILT_PATH,
  type FrontComponentSharedDependenciesManifest,
  SHARED_DEPENDENCIES_IMPORT_SPECIFIER,
} from 'twenty-shared/application';

const RESERVED_DEPENDENCY_PREFIXES = ['twenty-client-sdk', 'twenty-sdk'];

type PackageJsonWithSharedDependencies = {
  frontComponentSharedDependencies?: unknown;
};

const getSharedDependenciesErrors = (dependencies: string[]): string[] => {
  const errors: string[] = [];
  const seenDependencies = new Set<string>();

  for (const dependency of dependencies) {
    if (!isNonEmptyString(dependency)) {
      errors.push(
        '"frontComponentSharedDependencies" entries in package.json must be non-empty strings',
      );
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

  return errors;
};

export const extractFrontComponentSharedDependencies = async (
  appPath: string,
): Promise<{
  sharedDependencies?: FrontComponentSharedDependenciesManifest;
  errors: string[];
}> => {
  const packageJsonPath = path.join(appPath, 'package.json');

  if (!(await pathExists(packageJsonPath))) {
    return { errors: [] };
  }

  const packageJson =
    await readJson<PackageJsonWithSharedDependencies>(packageJsonPath);
  const declaredDependencies = packageJson.frontComponentSharedDependencies;

  if (declaredDependencies === undefined) {
    return { errors: [] };
  }

  if (!Array.isArray(declaredDependencies)) {
    return {
      errors: [
        '"frontComponentSharedDependencies" in package.json must be an array of package specifiers',
      ],
    };
  }

  if (!isNonEmptyArray(declaredDependencies)) {
    return { errors: [] };
  }

  const errors = getSharedDependenciesErrors(declaredDependencies as string[]);

  if (isNonEmptyArray(errors)) {
    return { errors };
  }

  return {
    sharedDependencies: {
      dependencies: normalizeSharedDependencies(
        declaredDependencies as string[],
      ),
      builtPath: FRONT_COMPONENT_SHARED_DEPENDENCIES_BUILT_PATH,
      builtChecksum: null,
    },
    errors: [],
  };
};
