import dotenv from 'dotenv';
import assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  AppManifest,
  CoreEntityManifest,
  ObjectManifest,
  PackageJson,
} from '../types/config.types';
import { validateSchema } from '../utils/schema-validator';
import { parseJsoncFile } from './jsonc-parser';
import { loadManifestFromDecorators } from '../utils/load-manifest-from-decorators';

type Sources = { [key: string]: string | Sources };

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
    const entities = await fs.readdir(coreEntityPath);

    for (const entity of entities) {
      const entityPath = path.join(coreEntityPath, entity);
      const entityResources = await fs.readdir(entityPath);

      const entityManifests = entityResources.filter(
        (file) =>
          file.endsWith('.manifest.jsonc') || file.endsWith('.manifest.json'),
      );

      assert(
        entityManifests.length === 1,
        'Entity should have strictly one manifest file',
      );

      const entityManifest = entityManifests[0];

      const coreEntityManifest = await parseJsoncFile(
        path.join(coreEntityPath, entity, entityManifest),
      );

      const entitySources = entityResources.filter(
        (folder) => folder === 'src',
      );

      assert(
        entitySources.length <= 1,
        'Entity should have less than one src folder or file',
      );

      if (entitySources.length === 1) {
        const entitySourcePath = path.join(
          coreEntityPath,
          entity,
          entitySources[0],
        );

        const sources = await loadFolderContentIntoJson(entitySourcePath);

        coreEntityManifest['code'] = { src: sources };
      }

      await validator(coreEntityManifest, coreEntityPath);

      coreEntities.push(coreEntityManifest);
    }
  }

  return coreEntities;
};

const loadFolderContentIntoJson = async (
  sourcePath: string,
): Promise<Sources> => {
  const sources: Sources = {};

  const resources = await fs.readdir(sourcePath);

  for (const resource of resources) {
    const resourcePath = path.join(sourcePath, resource);
    const stats = await fs.stat(resourcePath);
    if (stats.isFile()) {
      sources[resource] = await fs.readFile(resourcePath, 'utf8');
    } else {
      sources[resource] = await loadFolderContentIntoJson(resourcePath);
    }
  }

  return sources;
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

  let envFile = '';

  try {
    const envFilePath = await findPathFile(appPath, '.env');

    envFile = await fs.readFile(envFilePath, 'utf8');
  } catch {
    // Allow missing .env
  }

  const envVariables = dotenv.parse(envFile);

  const packageJsonEnv = rawPackageJson.env || {};

  for (const key of Object.keys(envVariables)) {
    if (packageJsonEnv[key]) {
      packageJsonEnv[key] = {
        isSecret: false,
        ...packageJsonEnv[key],
        value: envVariables[key],
      };
    } else {
      throw new Error(
        `Environment variable "${key}" is defined in .env but missing from package.json. Please add it to the "env" section in package.json.`,
      );
    }
  }

  const packageJson = { ...rawPackageJson, env: packageJsonEnv };

  await validateSchema('appManifest', packageJson, packageJsonPath);

  const agents = await loadCoreEntity(
    path.join(appPath, 'agents'),
    (manifest, path) => validateSchema('agent', manifest, path),
  );

  const objectFromManifests = await loadCoreEntity(
    path.join(appPath, 'objects'),
    (manifest, path) => validateSchema('object', manifest, path),
  );

  const serverlessFunctions = await loadCoreEntity(
    path.join(appPath, 'serverlessFunctions'),
    (manifest, path) => validateSchema('serverlessFunction', manifest, path),
  );

  const { objects: objectsFromDecorators } = loadManifestFromDecorators();

  const objects = (
    [...objectFromManifests, ...objectsFromDecorators] as ObjectManifest[]
  ).map((object) => {
    object.standardId = object.universalIdentifier;
    return object;
  });

  return {
    packageJson,
    yarnLock: rawYarnLock,
    manifest: {
      ...packageJson,
      agents,
      objects,
      serverlessFunctions,
    },
  };
};
