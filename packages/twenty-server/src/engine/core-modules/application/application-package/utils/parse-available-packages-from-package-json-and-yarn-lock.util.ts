import { type PackageJson } from 'type-fest';

const PACKAGE_VERSION_REGEX =
  /^"(@?[^@]+(?:\/[^@]+)?)@.*?":\n\s+version:\s*(.+)$/gm;

const MAX_PACKAGE_VERSION_MATCHES = 1_000;

export const parseAvailablePackagesFromPackageJsonAndYarnLock = (
  packageJsonContent: string,
  yarnLockContent: string,
): Record<string, string> => {
  const packageJson = JSON.parse(packageJsonContent) as PackageJson;
  const versions: Record<string, string> = {};
  let match: RegExpExecArray | null;
  let matchCount = 0;

  while (
    matchCount < MAX_PACKAGE_VERSION_MATCHES &&
    (match = PACKAGE_VERSION_REGEX.exec(yarnLockContent)) !== null
  ) {
    matchCount += 1;
    const packageName = match[1];
    const version = match[2];

    if (packageJson.dependencies?.[packageName]) {
      versions[packageName] = version;
    }
  }

  return versions;
};
