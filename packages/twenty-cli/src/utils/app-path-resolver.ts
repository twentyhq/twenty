import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  findNearbyApps,
  findProjectRoot,
  isValidAppPath,
} from './app-discovery';

export const resolveAppPath = async (
  providedPath?: string,
  verbose = false,
): Promise<string> => {
  if (providedPath && path.isAbsolute(providedPath)) {
    return validateAppPath(providedPath, verbose);
  }

  if (providedPath) {
    return resolveRelativePath(providedPath);
  }

  return autoDetectAppPath(verbose);
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

  throw new Error(`Cannot find twenty-app.json at any of these locations:
  - ${fromCwd}
  - ${projectRoot ? path.resolve(projectRoot, providedPath) : 'N/A (no project root found)'}
  
Please check the path or run from the correct directory.`);
};

const autoDetectAppPath = async (verbose = false): Promise<string> => {
  let currentDir = process.cwd();
  const maxDepth = 10;
  let depth = 0;

  while (depth < maxDepth) {
    if (await isValidAppPath(currentDir)) {
      if (verbose) {
        console.log(chalk.gray(`Auto-detected app path: ${currentDir}`));
      }
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;

    currentDir = parentDir;
    depth++;
  }

  const suggestions = await findNearbyApps(process.cwd());
  let errorMessage =
    'No twenty-app.json found in current directory or parent directories.';

  if (suggestions.length > 0) {
    errorMessage += '\n\nFound Twenty applications nearby:';
    suggestions.forEach((suggestion, i) => {
      errorMessage += `\n  ${i + 1}. ${suggestion}`;
    });
    errorMessage +=
      '\n\nTry running from one of these directories or use --path option.';
  } else {
    errorMessage += '\n\nRun `twenty app init` to create a new application.';
  }

  throw new Error(errorMessage);
};

const validateAppPath = async (
  appPath: string,
  verbose = false,
): Promise<string> => {
  if (verbose) {
    console.log(chalk.gray(`Checking app path: ${appPath}`));
  }

  const jsoncManifestPath = path.join(appPath, 'twenty-app.jsonc');
  const jsonManifestPath = path.join(appPath, 'twenty-app.json');

  const hasJsoncManifest = await fs.pathExists(jsoncManifestPath);
  const hasJsonManifest = await fs.pathExists(jsonManifestPath);

  if (!hasJsoncManifest && !hasJsonManifest) {
    let errorMessage = `No manifest file found. Expected twenty-app.jsonc or twenty-app.json in: ${appPath}`;

    if (await fs.pathExists(appPath)) {
      try {
        const files = await fs.readdir(appPath);
        errorMessage += `\n\nFiles in directory: ${files.join(', ')}`;
      } catch {
        errorMessage += '\n\nCould not read directory contents.';
      }
    } else {
      errorMessage += '\n\nDirectory does not exist.';
    }

    throw new Error(errorMessage);
  }

  return appPath;
};
