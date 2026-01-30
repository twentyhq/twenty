import { basename, extname, relative } from 'path';
import { readFile } from 'fs-extra';
import { glob } from 'fast-glob';
import {
  type EntityFilePaths,
  extractDefineEntity,
  ManifestEntityKey,
  TARGET_FUNCTION_TO_ENTITY_KEY_MAPPING,
} from '@/cli/utilities/build/manifest/manifest-extract-config';
import { extractManifestFromFile } from '@/cli/utilities/build/manifest/manifest-extract-config-from-file-v2';
import {
  type Application,
  type ApplicationManifest,
  type AssetManifest,
  ASSETS_DIR,
  type FieldManifest,
  type FrontComponentManifest,
  type LogicFunctionManifest,
  type ObjectManifest,
  type RoleManifest,
} from 'twenty-shared/application';
import { parseJsoncFile } from '@/cli/utilities/file/file-jsonc';
import { findPathFile } from '@/cli/utilities/file/file-find';
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

type ExtractedFunctionManifest = Omit<
  LogicFunctionManifest,
  'sourceHandlerPath' | 'builtHandlerPath' | 'builtHandlerChecksum'
> & {
  handler: string;
};

type ExtractedFrontComponentManifest = Omit<
  FrontComponentManifest,
  | 'sourceComponentPath'
  | 'builtComponentPath'
  | 'builtComponentChecksum'
  | 'componentName'
> & {
  component: { name: string };
};

export const buildManifest = async (
  appPath: string,
): Promise<{ manifest: ApplicationManifest; filePaths: EntityFilePaths }> => {
  const filePaths = await loadSources(appPath);
  let application: Application | undefined;
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
        application = await extractManifestFromFile<Application>({
          appPath,
          filePath,
        });
        applicationFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.Objects: {
        objects.push(
          await extractManifestFromFile<ObjectManifest>({
            appPath,
            filePath,
          }),
        );
        objectsFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.Fields: {
        fields.push(
          await extractManifestFromFile<FieldManifest>({
            appPath,
            filePath,
          }),
        );
        fieldsFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.Roles: {
        roles.push(
          await extractManifestFromFile<RoleManifest>({
            appPath,
            filePath,
          }),
        );
        rolesFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.LogicFunctions: {
        const extractedConfig =
          await extractManifestFromFile<ExtractedFunctionManifest>({
            appPath,
            filePath,
          });
        const { handler: _, ...rest } = extractedConfig;

        const config: LogicFunctionManifest = {
          ...rest,
          handlerName: 'default.handler',
          sourceHandlerPath: filePath,
          builtHandlerPath: filePath.replace(/\.tsx?$/, '.mjs'),
          builtHandlerChecksum: null,
        };

        logicFunctions.push(config);
        logicFunctionsFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.FrontComponents: {
        const extractedConfig =
          await extractManifestFromFile<ExtractedFrontComponentManifest>({
            appPath,
            filePath,
          });
        const { component, ...rest } = extractedConfig;

        const config: FrontComponentManifest = {
          ...rest,
          componentName: component.name,
          sourceComponentPath: filePath,
          builtComponentPath: filePath.replace(/\.tsx?$/, '.mjs'),
          builtComponentChecksum: null,
        };

        frontComponents.push(config);
        frontComponentsFilePaths.push(relativePath);
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
  }

  if (!application) {
    throw new Error(
      'Cannot build application, please export default defineApplication() to define an application',
    );
  }

  const packageJson = await parseJsoncFile(
    await findPathFile(appPath, 'package.json'),
  );

  const yarnLock = await readFile(
    await findPathFile(appPath, 'yarn.lock'),
    'utf8',
  );

  const manifest = {
    application,
    objects,
    fields,
    roles,
    logicFunctions,
    frontComponents,
    publicAssets,
    sources: {},
    packageJson,
    yarnLock,
  };

  const entityFilePaths: EntityFilePaths = {
    application: applicationFilePaths,
    objects: objectsFilePaths,
    fields: fieldsFilePaths,
    roles: rolesFilePaths,
    logicFunctions: logicFunctionsFilePaths,
    frontComponents: frontComponentsFilePaths,
  };

  return { manifest, filePaths: entityFilePaths };
};
