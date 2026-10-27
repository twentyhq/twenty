import { isDefined } from 'twenty-shared/utils';
import { type PackageJson } from 'type-fest';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

const ROOT_WORKSPACE_ENTRY_REGEX = /^"?[^\s"]+@workspace:\."?:$/;
const LOCK_ENTRY_DEPENDENCY_REGEX = /^ {4}"?([^"]+?)"?: "?([^"]+)"?$/;
const LOCK_ENTRY_KEY_REGEX = /^[^\s#].*:$/;

const getDeclaredDependencies = (
  packageJson: PackageJson,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries({
      ...packageJson.devDependencies,
      ...packageJson.optionalDependencies,
      ...packageJson.dependencies,
    }).filter((entry): entry is [string, string] => isDefined(entry[1])),
  );

// Yarn records the dependencies of the root package in its own lock entry
const parseRootWorkspaceDependencies = (
  yarnLockContent: string,
): Record<string, string> | undefined => {
  const lines = yarnLockContent.split('\n');
  const entryIndex = lines.findIndex((line) =>
    ROOT_WORKSPACE_ENTRY_REGEX.test(line),
  );

  if (entryIndex === -1) {
    return undefined;
  }

  const dependencies: Record<string, string> = {};
  let isInDependencies = false;

  for (const line of lines.slice(entryIndex + 1)) {
    if (!line.startsWith('  ')) {
      break;
    }

    if (!line.startsWith('    ')) {
      isInDependencies = line === '  dependencies:';
      continue;
    }

    const match = LOCK_ENTRY_DEPENDENCY_REGEX.exec(line);

    if (isInDependencies && isDefined(match)) {
      dependencies[match[1]] = match[2];
    }
  }

  return dependencies;
};

const parseLockedDescriptors = (yarnLockContent: string): Set<string> =>
  new Set(
    yarnLockContent
      .split('\n')
      .filter((line) => LOCK_ENTRY_KEY_REGEX.test(line))
      .flatMap((line) => line.slice(0, -1).split(', '))
      .map((descriptor) => descriptor.replace(/^"|"$/g, '')),
  );

// Yarn writes bare ranges as npm: ranges
const toLockedDescriptorCandidates = (range: string): string[] => [
  range,
  `npm:${range}`,
];

const isMatchingRootWorkspace = ({
  declaredDependencies,
  rootWorkspaceDependencies,
}: {
  declaredDependencies: Record<string, string>;
  rootWorkspaceDependencies: Record<string, string>;
}): boolean => {
  const declaredNames = Object.keys(declaredDependencies);

  return (
    declaredNames.length === Object.keys(rootWorkspaceDependencies).length &&
    declaredNames.every((name) =>
      toLockedDescriptorCandidates(declaredDependencies[name]).includes(
        rootWorkspaceDependencies[name],
      ),
    )
  );
};

// Lockfiles without a root entry, like Yarn 1 ones, only list descriptors
const isEveryDependencyLocked = ({
  declaredDependencies,
  lockedDescriptors,
}: {
  declaredDependencies: Record<string, string>;
  lockedDescriptors: Set<string>;
}): boolean =>
  Object.entries(declaredDependencies).every(([name, range]) =>
    toLockedDescriptorCandidates(range).some((descriptor) =>
      lockedDescriptors.has(`${name}@${descriptor}`),
    ),
  );

// The install follows the package.json wherever it disagrees with the
// yarn.lock, while the layer name only covers the yarn.lock
export const assertPackageJsonMatchesYarnLockOrThrow = ({
  applicationUniversalIdentifier,
  packageJsonContent,
  yarnLockContent,
}: {
  applicationUniversalIdentifier: string;
  packageJsonContent: string;
  yarnLockContent: string;
}): void => {
  const packageJson = JSON.parse(packageJsonContent) as PackageJson;
  const declaredDependencies = getDeclaredDependencies(packageJson);
  const rootWorkspaceDependencies =
    parseRootWorkspaceDependencies(yarnLockContent);

  const isMatching =
    !isDefined(packageJson.resolutions) &&
    (isDefined(rootWorkspaceDependencies)
      ? isMatchingRootWorkspace({
          declaredDependencies,
          rootWorkspaceDependencies,
        })
      : isEveryDependencyLocked({
          declaredDependencies,
          lockedDescriptors: parseLockedDescriptors(yarnLockContent),
        }));

  if (!isMatching) {
    throw new ApplicationException(
      `The package.json of application ${applicationUniversalIdentifier} does not match its yarn.lock`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }
};
