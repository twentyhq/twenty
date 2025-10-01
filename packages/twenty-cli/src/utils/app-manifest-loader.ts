import * as fs from 'fs-extra';
import * as path from 'path';
import {
  AppManifest,
  CoreEntityManifest,
  PackageJson,
} from '../types/config.types';
import { parseJsoncFile } from './jsonc-parser';
import { validateSchema } from '../utils/schema-validator';

const findPathFile = async (
  appPath: string,
  fileName: string,
): Promise<string> => {
  const jsonPath = path.join(appPath, fileName);

  if (await fs.pathExists(jsonPath)) {
    return jsonPath;
  }

  throw new Error(`${fileName} not found in ${appPath}`);
};

const loadCoreEntity = async (
  coreEntityPath: string,
  validator: (manifest: CoreEntityManifest, path: string) => Promise<void>,
): Promise<CoreEntityManifest[]> => {
  const coreEntities: CoreEntityManifest[] = [];

  if (await fs.pathExists(coreEntityPath)) {
    const files = await fs.readdir(coreEntityPath);
    const coreEntityFileNames = files.filter(
      (file) => file.endsWith('.jsonc') || file.endsWith('.json'),
    );

    for (const fileName of coreEntityFileNames) {
      const coreEntityManifest = await parseJsoncFile(
        path.join(coreEntityPath, fileName),
      );

      await validator(coreEntityManifest, coreEntityPath);

      coreEntities.push(coreEntityManifest);
    }
  }

  return coreEntities;
};

export const loadManifest = async (
  appPath: string,
): Promise<{
  packageJson: PackageJson;
  yarnLock: string;
  manifest: AppManifest;
}> => {
  const packageJsonPath = await findPathFile(appPath, 'package.json');
  const rawPackageJson = await parseJsoncFile(packageJsonPath);

  const yarnLockPath = await findPathFile(appPath, 'yarn.lock');
  const rawYarnLock = await fs.readFile(yarnLockPath, 'utf8');

  await validateSchema('app-manifest', rawPackageJson, packageJsonPath);

  const agents = await loadCoreEntity(
    path.join(appPath, 'agents'),
    (manifest, path) => validateSchema('agent', manifest, path),
  );

  const objects = await loadCoreEntity(
    path.join(appPath, 'objects'),
    (manifest, path) => validateSchema('object', manifest, path),
  );

  return {
    packageJson: rawPackageJson,
    yarnLock: rawYarnLock,
    manifest: {
      ...rawPackageJson,
      agents,
      objects,
    },
  };
};
