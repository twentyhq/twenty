import * as fs from 'fs-extra';
import * as path from 'path';
import { APP_MANIFEST_SCHEMA_URL } from '../constants/schemas';

export const findProjectRoot = async (): Promise<string | null> => {
  let currentDir = process.cwd();
  const maxDepth = 10;
  let depth = 0;

  while (depth < maxDepth) {
    const nxConfig = path.join(currentDir, 'nx.json');
    const packageJson = path.join(currentDir, 'package.json');

    if (await fs.pathExists(nxConfig)) {
      return currentDir;
    }

    if (await fs.pathExists(packageJson)) {
      try {
        const pkg = await fs.readJson(packageJson);
        if (pkg.workspaces || pkg.name === 'twenty') {
          return currentDir;
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;

    currentDir = parentDir;
    depth++;
  }

  return null;
};

export const findNearbyApps = async (startDir: string): Promise<string[]> => {
  const apps: string[] = [];

  try {
    const searchPaths = [
      startDir,
      path.join(startDir, '..'),
      path.join(startDir, '../..'),
      path.join(startDir, 'packages/twenty-apps'),
      path.join(startDir, '../../packages/twenty-apps'),
    ];

    for (const searchPath of searchPaths) {
      if (await fs.pathExists(searchPath)) {
        const items = await fs.readdir(searchPath, { withFileTypes: true });

        for (const item of items) {
          if (item.isDirectory()) {
            const itemPath = path.join(searchPath, item.name);
            if (await isValidAppPath(itemPath)) {
              apps.push(itemPath);
            }
          }
        }
      }
    }
  } catch {
    // Ignore errors during search
  }

  return apps.slice(0, 5);
};

export const isValidAppPath = async (appPath: string): Promise<boolean> => {
  const packageJsonPath = path.join(appPath, 'package.json');

  if (!(await fs.pathExists(packageJsonPath))) {
    return false;
  }

  try {
    const packageJson = await fs.readJson(packageJsonPath);

    // Check if this is a Twenty app by looking for the exact $schema URL
    return packageJson.$schema === APP_MANIFEST_SCHEMA_URL;
  } catch {
    return false;
  }
};
