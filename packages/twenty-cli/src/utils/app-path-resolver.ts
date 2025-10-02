import * as fs from 'fs-extra';
import * as path from 'path';
import {
  findNearbyApps,
  findProjectRoot,
  isValidAppPath,
} from './app-discovery';

export const resolveAppPath = async (
  providedPath?: string,
): Promise<string> => {
  if (providedPath && path.isAbsolute(providedPath)) {
    return validateAppPath(providedPath);
  }

  if (providedPath) {
    return resolveRelativePath(providedPath);
  }

  return autoDetectAppPath();
};

const resolveRelativePath = async (providedPath: string): Promise<string> => {
  const fromCwd = path.resolve(process.cwd(), providedPath);
  if (await isValidAppPath(fromCwd)) {
    return fromCwd;
  }

  const projectRoot = await findProjectRoot();
  if (projectRoot) {
    const fromProjectRoot = path.resolve(projectRoot, providedPath);
    if (await isValidAppPath(fromProjectRoot)) {
      return fromProjectRoot;
    }
  }

  throw new Error(`Cannot find Twenty app package.json at any of these locations:
  - ${fromCwd}
  - ${projectRoot ? path.resolve(projectRoot, providedPath) : 'N/A (no project root found)'}

Please check the path or run from the correct directory.`);
};

const autoDetectAppPath = async (): Promise<string> => {
  let currentDir = process.cwd();
  const maxDepth = 10;
  let depth = 0;

  while (depth < maxDepth) {
    if (await isValidAppPath(currentDir)) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;

    currentDir = parentDir;
    depth++;
  }

  const suggestions = await findNearbyApps(process.cwd());
  let errorMessage =
    'No Twenty app found in current directory or parent directories.';

  if (suggestions.length > 0) {
    errorMessage += '\n\nFound Twenty applications nearby:';
    suggestions.forEach((suggestion: string, i: number) => {
      errorMessage += `\n  ${i + 1}. ${suggestion}`;
    });
    errorMessage +=
      '\n\nTry running from one of these directories or use --path option.';
  } else {
    errorMessage += '\n\nRun `twenty app init` to create a new application.';
  }

  throw new Error(errorMessage);
};

const validateAppPath = async (appPath: string): Promise<string> => {
  if (!(await fs.pathExists(appPath))) {
    throw new Error(`Directory does not exist: ${appPath}`);
  }

  if (!(await isValidAppPath(appPath))) {
    let errorMessage = `Not a valid Twenty app: ${appPath}`;

    const packageJsonPath = path.join(appPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      errorMessage +=
        '\n\npackage.json found but missing required $schema field for Twenty apps.';
    } else {
      errorMessage += '\n\npackage.json not found.';
    }

    errorMessage += '\n\nRun `twenty app init` to create a new application.';

    throw new Error(errorMessage);
  }

  return appPath;
};
