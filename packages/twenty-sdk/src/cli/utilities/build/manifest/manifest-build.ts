import {
  type EntityFilePaths,
  extractDefineEntity,
  ManifestEntityKey,
  TARGET_FUNCTION_TO_ENTITY_KEY_MAPPING,
  TargetFunction,
} from '@/cli/utilities/build/manifest/manifest-extract-config';
import { extractManifestFromFile } from '@/cli/utilities/build/manifest/manifest-extract-config-from-file';
import { getDefaultFieldsInObjectFields } from '@/cli/utilities/build/manifest/utils/get-default-fields-in-object-fields';
import { type ApplicationConfig, type LogicFunctionConfig } from '@/sdk/define';
import { type FrontComponentConfig } from '@/sdk/define/front-component/front-component-config';
import { type ObjectConfig } from '@/sdk/define/objects/object-config';
import { type PageLayoutConfig } from '@/sdk/define/page-layouts/page-layout-config';
import { type PageLayoutTabConfig } from '@/sdk/define/page-layouts/page-layout-tab-config';
import { type ViewConfig } from '@/sdk/define/views/view-config';
import { readFile } from 'node:fs/promises';
import { basename, extname, relative } from 'path';
import { glob } from 'tinyglobby';
import {
  type AgentManifest,
  type ApplicationManifest,
  type AssetManifest,
  ASSETS_DIR,
  type ConnectionProviderManifest,
  type FieldManifest,
  type FrontComponentCommandManifest,
  type FrontComponentManifest,
  type LogicFunctionManifest,
  type Manifest,
  type NavigationMenuItemManifest,
  type ObjectManifest,
  type PageLayoutManifest,
  type PageLayoutTabManifest,
  type RoleManifest,
  type SkillManifest,
  type ViewManifest,
  type PostInstallLogicFunctionApplicationManifest,
  type PreInstallLogicFunctionApplicationManifest,
} from 'twenty-shared/application';
import { getInputSchemaFromSourceCode } from 'twenty-shared/logic-function';
import { assertUnreachable } from 'twenty-shared/utils';
import { addMissingFieldOptionIds } from '@/cli/utilities/build/manifest/utils/add-missing-field-option-ids';
import { type PostInstallLogicFunctionConfig } from '@/sdk/define/logic-functions/post-install-logic-function-config';
import { type PreInstallLogicFunctionConfig } from '@/sdk/define/logic-functions/pre-install-logic-function-config';
import { fromRoleConfigToRoleManifest } from '@/cli/utilities/build/manifest/utils/from-role-config-to-role-manifest';
import { type RoleConfig } from '@/sdk/define/roles/role-config';

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
    absolute: true,
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
  const skills: SkillManifest[] = [];
  const agents: AgentManifest[] = [];
  const connectionProviders: ConnectionProviderManifest[] = [];
  const logicFunctions: LogicFunctionManifest[] = [];
  const frontComponents: FrontComponentManifest[] = [];
  const publicAssets: AssetManifest[] = [];
  const views: ViewManifest[] = [];
  const navigationMenuItems: NavigationMenuItemManifest[] = [];
  const pageLayouts: PageLayoutManifest[] = [];
  const pageLayoutTabs: PageLayoutTabManifest[] = [];
  const postInstallLogicFunctions: PostInstallLogicFunctionApplicationManifest[] =
    [];
  const preInstallLogicFunctions: PreInstallLogicFunctionApplicationManifest[] =
    [];
  const applicationFilePaths: string[] = [];
  const objectsFilePaths: string[] = [];
  const fieldsFilePaths: string[] = [];
  const rolesFilePaths: string[] = [];
  const skillsFilePaths: string[] = [];
  const agentsFilePaths: string[] = [];
  const connectionProvidersFilePaths: string[] = [];
  const logicFunctionsFilePaths: string[] = [];
  const frontComponentsFilePaths: string[] = [];
  const publicAssetsFilePaths: string[] = [];
  const viewsFilePaths: string[] = [];
  const navigationMenuItemsFilePaths: string[] = [];
  const pageLayoutsFilePaths: string[] = [];
  const pageLayoutTabsFilePaths: string[] = [];

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

        const {
          objectFields: objectFieldsWithDefaults,
          fields: reverseRelationFields,
        } = getDefaultFieldsInObjectFields(extract.config);

        const labelIdentifierFieldMetadataUniversalIdentifier =
          extract.config.labelIdentifierFieldMetadataUniversalIdentifier ??
          objectFieldsWithDefaults.find((field) => field.name === 'name')
            ?.universalIdentifier;

        if (!labelIdentifierFieldMetadataUniversalIdentifier) {
          errors.push(
            `No label identifier field found for object ${extract.config.nameSingular}. Please add a field with name "name" to your object.`,
          );
          break;
        }

        const objectManifest: ObjectManifest = {
          ...extract.config,
          fields: objectFieldsWithDefaults.map(addMissingFieldOptionIds),
          labelIdentifierFieldMetadataUniversalIdentifier,
        };

        objects.push(objectManifest);
        fields.push(...reverseRelationFields);

        errors.push(...extract.errors);
        objectsFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.Fields: {
        const extract = await extractManifestFromFile<FieldManifest>({
          appPath,
          filePath,
        });
        const fieldConfig = addMissingFieldOptionIds(extract.config);
        fields.push(fieldConfig);
        errors.push(...extract.errors);
        fieldsFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.Roles: {
        const extract = await extractManifestFromFile<RoleConfig>({
          appPath,
          filePath,
        });
        const roleConfig = fromRoleConfigToRoleManifest(extract.config);
        roles.push(roleConfig);
        errors.push(...extract.errors);
        rolesFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.Skills: {
        const extract = await extractManifestFromFile<SkillManifest>({
          appPath,
          filePath,
        });
        skills.push(extract.config);
        errors.push(...extract.errors);
        skillsFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.Agents: {
        const extract = await extractManifestFromFile<AgentManifest>({
          appPath,
          filePath,
        });
        agents.push(extract.config);
        errors.push(...extract.errors);
        agentsFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.ConnectionProviders: {
        const extract =
          await extractManifestFromFile<ConnectionProviderManifest>({
            appPath,
            filePath,
          });
        connectionProviders.push(extract.config);
        errors.push(...extract.errors);
        connectionProvidersFilePaths.push(relativePath);
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

        if (
          targetFunctionName === TargetFunction.DefinePostInstallLogicFunction
        ) {
          const postInstallHookConfig =
            extract.config as PostInstallLogicFunctionConfig;

          postInstallLogicFunctions.push({
            universalIdentifier: extract.config.universalIdentifier,
            shouldRunOnVersionUpgrade:
              postInstallHookConfig.shouldRunOnVersionUpgrade ?? false,
            shouldRunSynchronously:
              postInstallHookConfig.shouldRunSynchronously ?? false,
          });
        }

        if (
          targetFunctionName === TargetFunction.DefinePreInstallLogicFunction
        ) {
          const preInstallHookConfig =
            extract.config as PreInstallLogicFunctionConfig;

          preInstallLogicFunctions.push({
            universalIdentifier: extract.config.universalIdentifier,
            shouldRunOnVersionUpgrade:
              preInstallHookConfig.shouldRunOnVersionUpgrade ?? false,
          });
        }

        break;
      }
      case ManifestEntityKey.FrontComponents: {
        const extract = await extractManifestFromFile<FrontComponentConfig>({
          appPath,
          filePath,
        });

        errors.push(...extract.errors);

        const { component, command, ...rest } = extract.config;

        const relativeFilePath = relative(appPath, filePath);

        const config: FrontComponentManifest = {
          ...rest,
          componentName: component.name,
          sourceComponentPath: relativeFilePath,
          builtComponentPath: relativeFilePath.replace(/\.tsx?$/, '.mjs'),
          builtComponentChecksum: '',
          isHeadless: rest.isHeadless ?? false,
          // transformed by conditionalAvailabilityTransformPlugin
          command: command as FrontComponentCommandManifest,
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
      case ManifestEntityKey.PageLayouts: {
        const extract = await extractManifestFromFile<PageLayoutConfig>({
          appPath,
          filePath,
        });

        const pageLayoutManifest: PageLayoutManifest = {
          ...extract.config,
        };

        pageLayouts.push(pageLayoutManifest);
        errors.push(...extract.errors);
        pageLayoutsFilePaths.push(relativePath);
        break;
      }
      case ManifestEntityKey.PageLayoutTabs: {
        const extract = await extractManifestFromFile<PageLayoutTabConfig>({
          appPath,
          filePath,
        });

        const pageLayoutTabManifest: PageLayoutTabManifest = {
          ...extract.config,
        };

        pageLayoutTabs.push(pageLayoutTabManifest);
        errors.push(...extract.errors);
        pageLayoutTabsFilePaths.push(relativePath);
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
    const relativePath = relative(appPath, assetFile);
    publicAssets.push({
      filePath: relativePath,
      fileName: basename(assetFile),
      fileType: extname(assetFile).replace(/^\./, ''),
      checksum: null,
    });
    publicAssetsFilePaths.push(relativePath);
  }

  if (!application) {
    errors.push(
      'Cannot build application, please export default defineApplication() to define an application',
    );
  }

  if (postInstallLogicFunctions.length > 1) {
    errors.push(
      'Only one post install logic function is allowed per application',
    );
  }

  if (preInstallLogicFunctions.length > 1) {
    errors.push(
      'Only one pre install logic function is allowed per application',
    );
  }

  if (application && postInstallLogicFunctions.length >= 1) {
    application = {
      ...application,
      postInstallLogicFunction: postInstallLogicFunctions[0],
    };
  }

  if (application && preInstallLogicFunctions.length >= 1) {
    application = {
      ...application,
      preInstallLogicFunction: preInstallLogicFunctions[0],
    };
  }

  const byId = <T extends { universalIdentifier: string }>(a: T, b: T) =>
    a.universalIdentifier.localeCompare(b.universalIdentifier);

  const byPath = <T extends { filePath: string }>(a: T, b: T) =>
    a.filePath.localeCompare(b.filePath);

  const manifest = !application
    ? null
    : {
        application,
        objects: objects.sort(byId),
        fields: fields.sort(byId),
        roles: roles.sort(byId),
        skills: skills.sort(byId),
        agents: agents.sort(byId),
        connectionProviders: connectionProviders.sort(byId),
        logicFunctions: logicFunctions.sort(byId),
        frontComponents: frontComponents.sort(byId),
        publicAssets: publicAssets.sort(byPath),
        views: views.sort(byId),
        navigationMenuItems: navigationMenuItems.sort(byId),
        pageLayouts: pageLayouts.sort(byId),
        pageLayoutTabs: pageLayoutTabs.sort(byId),
      };

  const entityFilePaths: EntityFilePaths = {
    application: applicationFilePaths,
    objects: objectsFilePaths,
    fields: fieldsFilePaths,
    roles: rolesFilePaths,
    skills: skillsFilePaths,
    agents: agentsFilePaths,
    connectionProviders: connectionProvidersFilePaths,
    logicFunctions: logicFunctionsFilePaths,
    frontComponents: frontComponentsFilePaths,
    publicAssets: publicAssetsFilePaths,
    views: viewsFilePaths,
    navigationMenuItems: navigationMenuItemsFilePaths,
    pageLayouts: pageLayoutsFilePaths,
    pageLayoutTabs: pageLayoutTabsFilePaths,
  };

  return { manifest, filePaths: entityFilePaths, errors };
};
