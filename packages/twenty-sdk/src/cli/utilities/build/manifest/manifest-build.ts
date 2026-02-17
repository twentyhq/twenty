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
import { type ObjectConfig } from '@/sdk/objects/object-config';
import { type ViewConfig } from '@/sdk/views/view-config';
import { glob } from 'fast-glob';
import { readFile } from 'fs-extra';
import { basename, extname, relative } from 'path';
import {
  type ApplicationManifest,
  type AssetManifest,
  ASSETS_DIR,
  type FieldManifest,
  type FrontComponentManifest,
  type LogicFunctionManifest,
  type Manifest,
  type NavigationMenuItemManifest,
  type ObjectManifest,
  type RoleManifest,
  type ViewManifest,
} from 'twenty-shared/application';
import { getInputSchemaFromSourceCode } from 'twenty-shared/logic-function';
import { assertUnreachable } from 'twenty-shared/utils';
import { injectDefaultFieldsInObjectFields } from '@/cli/utilities/build/manifest/utils/inject-default-fields-in-object-fields';

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
  const views: ViewManifest[] = [];
  const navigationMenuItems: NavigationMenuItemManifest[] = [];

  const applicationFilePaths: string[] = [];
  const objectsFilePaths: string[] = [];
  const fieldsFilePaths: string[] = [];
  const rolesFilePaths: string[] = [];
  const logicFunctionsFilePaths: string[] = [];
  const frontComponentsFilePaths: string[] = [];
  const publicAssetsFilePaths: string[] = [];
  const viewsFilePaths: string[] = [];
  const navigationMenuItemsFilePaths: string[] = [];

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
        const extract = await extractManifestFromFile<ObjectConfig>({
          appPath,
          filePath,
        });

        const objectFieldsWithDefaultFields = injectDefaultFieldsInObjectFields(
          extract.config,
        );

        const labelIdentifierFieldMetadataUniversalIdentifier =
          extract.config.labelIdentifierFieldMetadataUniversalIdentifier ??
          objectFieldsWithDefaultFields.find((field) => field.name === 'name')
            ?.universalIdentifier;

        if (!labelIdentifierFieldMetadataUniversalIdentifier) {
          errors.push(
            `No label identifier field found for object ${extract.config.nameSingular}. Please add a field with name "name" to your object.`,
          );
          break;
        }

        const objectManifest: ObjectManifest = {
          ...extract.config,
          fields: objectFieldsWithDefaultFields,
          labelIdentifierFieldMetadataUniversalIdentifier,
        };

        objects.push(objectManifest);

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

        const toolInputSchema =
          rest.toolInputSchema ??
          (await getInputSchemaFromSourceCode(fileContent));

        const config: LogicFunctionManifest = {
          ...rest,
          toolInputSchema,
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
      case ManifestEntityKey.Views: {
        const extract = await extractManifestFromFile<ViewConfig>({
          appPath,
          filePath,
        });

        const viewManifest: ViewManifest = {
          ...extract.config,
        };

        views.push(viewManifest);
        errors.push(...extract.errors);
        viewsFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.NavigationMenuItems: {
        const extract =
          await extractManifestFromFile<NavigationMenuItemManifest>({
            appPath,
            filePath,
          });
        navigationMenuItems.push(extract.config);
        errors.push(...extract.errors);
        navigationMenuItemsFilePaths.push(relativePath);
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
        views,
        navigationMenuItems,
      };

  const entityFilePaths: EntityFilePaths = {
    application: applicationFilePaths,
    objects: objectsFilePaths,
    fields: fieldsFilePaths,
    roles: rolesFilePaths,
    logicFunctions: logicFunctionsFilePaths,
    frontComponents: frontComponentsFilePaths,
    publicAssets: publicAssetsFilePaths,
    views: viewsFilePaths,
    navigationMenuItems: navigationMenuItemsFilePaths,
  };

  return { manifest, filePaths: entityFilePaths, errors };
};
