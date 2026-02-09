import {
  type EntityFilePaths,
  extractDefineEntity,
  ManifestEntityKey,
  TARGET_FUNCTION_TO_ENTITY_KEY_MAPPING,
} from '@/cli/utilities/build/manifest/manifest-extract-config';
import { extractManifestFromFile } from '@/cli/utilities/build/manifest/manifest-extract-config-from-file';
import {
  type ApplicationConfig,
  type FrontComponentConfig,
  type LogicFunctionConfig,
} from '@/sdk';
import { glob } from 'fast-glob';
import * as fs from 'fs-extra';
import { readFile } from 'fs-extra';
import { basename, extname, relative, sep } from 'path';
import {
  type ApplicationManifest,
  type AssetManifest,
  ASSETS_DIR,
  type FieldManifest,
  type FrontComponentManifest,
  type LogicFunctionManifest,
  type Manifest,
  type ObjectManifest,
  type RoleManifest,
} from 'twenty-shared/application';
import { type Sources } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

const loadSources = async (appPath: string): Promise<string[]> => {
  return await glob(['**/*.ts', '**/*.tsx'], {
    cwd: appPath,
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**', '**/.twenty/**'],
    onlyFiles: true,
  });
};

const loadAssets = async (appPath: string) => {
  return await glob([`${ASSETS_DIR}/**/*`], {
    cwd: appPath,
    onlyFiles: true,
  });
};

const computeSources = async (
  appPath: string,
  sourceFilePaths: string[],
): Promise<Sources> => {
  const sources: Sources = {};

  for (const filepath of sourceFilePaths) {
    const relPath = relative(appPath, filepath);
    const parts = relPath.split(sep);
    const content = await fs.readFile(filepath, 'utf8');

    let current: Sources = sources;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = content;
      } else {
        current[part] = (current[part] ?? {}) as Sources;
        current = current[part] as Sources;
      }
    }
  }

  return sources;
};

export const buildManifest = async (
  appPath: string,
): Promise<{
  manifest: Manifest | null;
  filePaths: EntityFilePaths;
  errors: string[];
}> => {
  const filePaths = await loadSources(appPath);
  const errors: string[] = [];

  let application: ApplicationManifest | undefined;
  const objects: ObjectManifest[] = [];
  const fields: FieldManifest[] = [];
  const roles: RoleManifest[] = [];
  const logicFunctions: LogicFunctionManifest[] = [];
  const frontComponents: FrontComponentManifest[] = [];
  const publicAssets: AssetManifest[] = [];

  const applicationFilePaths: string[] = [];
  const objectsFilePaths: string[] = [];
  const fieldsFilePaths: string[] = [];
  const rolesFilePaths: string[] = [];
  const logicFunctionsFilePaths: string[] = [];
  const frontComponentsFilePaths: string[] = [];
  const publicAssetsFilePaths: string[] = [];

  for (const filePath of filePaths) {
    const fileContent = await readFile(filePath, 'utf-8');
    const relativePath = relative(appPath, filePath);

    const targetFunctionName = extractDefineEntity(fileContent);

    if (!targetFunctionName) {
      continue;
    }

    const entity = TARGET_FUNCTION_TO_ENTITY_KEY_MAPPING[targetFunctionName];

    switch (entity) {
      case ManifestEntityKey.Application: {
        const extract = await extractManifestFromFile<ApplicationConfig>({
          appPath,
          filePath,
        });

        application = {
          ...extract.config,
          yarnLockChecksum: null,
          packageJsonChecksum: null,
        };
        errors.push(...extract.errors);
        applicationFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.Objects: {
        const extract = await extractManifestFromFile<ObjectManifest>({
          appPath,
          filePath,
        });
        objects.push(extract.config);
        errors.push(...extract.errors);
        objectsFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.Fields: {
        const extract = await extractManifestFromFile<FieldManifest>({
          appPath,
          filePath,
        });
        fields.push(extract.config);
        errors.push(...extract.errors);
        fieldsFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.Roles: {
        const extract = await extractManifestFromFile<RoleManifest>({
          appPath,
          filePath,
        });
        roles.push(extract.config);
        errors.push(...extract.errors);
        rolesFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.LogicFunctions: {
        const extract = await extractManifestFromFile<LogicFunctionConfig>({
          appPath,
          filePath,
        });

        errors.push(...extract.errors);

        const { handler: _, ...rest } = extract.config;

        const relativeFilePath = relative(appPath, filePath);

        const config: LogicFunctionManifest = {
          ...rest,
          handlerName: 'default.config.handler',
          sourceHandlerPath: relativeFilePath,
          builtHandlerPath: relativeFilePath.replace(/\.tsx?$/, '.mjs'),
          builtHandlerChecksum: '[default-checksum]',
        };

        logicFunctions.push(config);
        logicFunctionsFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.FrontComponents: {
        const extract = await extractManifestFromFile<FrontComponentConfig>({
          appPath,
          filePath,
        });

        errors.push(...extract.errors);

        const { component, ...rest } = extract.config;

        const relativeFilePath = relative(appPath, filePath);

        const config: FrontComponentManifest = {
          ...rest,
          componentName: component.name,
          sourceComponentPath: relativeFilePath,
          builtComponentPath: relativeFilePath.replace(/\.tsx?$/, '.mjs'),
          builtComponentChecksum: '',
        };

        frontComponents.push(config);
        frontComponentsFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.PublicAssets: {
        // Public assets are handled below
        break;
      }
      default: {
        assertUnreachable(entity);
      }
    }
  }

  const assetFiles = await loadAssets(appPath);

  for (const assetFile of assetFiles) {
    publicAssets.push({
      filePath: assetFile,
      fileName: basename(assetFile),
      fileType: extname(assetFile).replace(/^\./, ''),
      checksum: null,
    });
    publicAssetsFilePaths.push(relative(appPath, assetFile));
  }

  if (!application) {
    errors.push(
      'Cannot build application, please export default defineApplication() to define an application',
    );
  }

  const manifest = !application
    ? null
    : {
        application,
        objects,
        fields,
        roles,
        logicFunctions,
        frontComponents,
        publicAssets,
        sources: await computeSources(appPath, filePaths),
      };

  const entityFilePaths: EntityFilePaths = {
    application: applicationFilePaths,
    objects: objectsFilePaths,
    fields: fieldsFilePaths,
    roles: rolesFilePaths,
    logicFunctions: logicFunctionsFilePaths,
    frontComponents: frontComponentsFilePaths,
    publicAssets: publicAssetsFilePaths,
  };

  return { manifest, filePaths: entityFilePaths, errors };
};
