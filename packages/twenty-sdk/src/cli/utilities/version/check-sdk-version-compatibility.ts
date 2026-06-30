import { readFile } from 'node:fs/promises';
import { join } from 'path';

import { pathExists } from '@/cli/utilities/file/fs-utils';
import chalk from 'chalk';
import sdkPackageJson from '../../../../package.json';

const getAppDeclaredSdkVersion = async (
  appPath: string,
): Promise<string | undefined> => {
  const pkgPath = join(appPath, 'package.json');

  if (!(await pathExists(pkgPath))) {
    return undefined;
  }

  try {
    const content = await readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(content) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    return (
      pkg.dependencies?.['twenty-sdk'] ??
      pkg.devDependencies?.['twenty-sdk'] ??
      undefined
    );
  } catch {
    return undefined;
  }
};

// Extracts the major version number from a semver string or range.
// Handles: "4.2.0", "^4.2.0", "~4.2.0", ">=4.0.0", "4.x", "4"
// Returns null for unparseable values like "latest", "*", "workspace:*"
const parseMajorVersion = (versionOrRange: string): number | null => {
  const match = versionOrRange.match(/(\d+)\./);

  if (match) {
    return parseInt(match[1], 10);
  }

  const exactMatch = versionOrRange.match(/^[~^>=<]*(\d+)$/);

  if (exactMatch) {
    return parseInt(exactMatch[1], 10);
  }

  return null;
};

export const checkSdkVersionCompatibility = async (
  appPath: string,
): Promise<void> => {
  const cliVersion = sdkPackageJson.version;
  const appDeclaredVersion = await getAppDeclaredSdkVersion(appPath);

  if (!cliVersion || !appDeclaredVersion) {
    return;
  }

  const cliMajor = parseMajorVersion(cliVersion);
  const appMajor = parseMajorVersion(appDeclaredVersion);

  if (cliMajor === null || appMajor === null) {
    return;
  }

  if (cliMajor !== appMajor) {
    console.warn(
      chalk.yellow(
        `⚠ Version mismatch: your app requires twenty-sdk@${appMajor}.x ` +
          `but the CLI running is v${cliVersion}. ` +
          `Major version mismatches may cause unexpected behavior.\n` +
          `  Update with: npm install -g twenty-sdk@${appMajor}`,
      ),
    );
    console.warn('');
  }
};
