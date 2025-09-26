import * as fs from 'fs-extra';
import * as path from 'path';
import { AppManifest, CoreEntityManifest } from '../types/config.types';
import { parseJsoncFile } from './jsonc-parser';
import { validateSchema } from '../utils/schema-validator';

const findPackageJsonFile = async (appPath: string): Promise<string> => {
  const jsonPath = path.join(appPath, 'package.json');

  if (await fs.pathExists(jsonPath)) {
    return jsonPath;
  }

  throw new Error(`package.json not found in ${appPath}`);
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

export const loadManifest = async (appPath: string): Promise<AppManifest> => {
  const packageJsonPath = await findPackageJsonFile(appPath);
  const rawPackageJson = await parseJsoncFile(packageJsonPath);

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
    ...rawPackageJson,
    agents,
    objects,
  };
};
