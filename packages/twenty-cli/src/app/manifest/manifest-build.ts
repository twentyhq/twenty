import { fromObjectConfigToObjectManifest } from '@/app/manifest/utils/from-object-config-to-object-manifest';
import { fromLogicFunctionConfigToLogicFunctionManifest } from '@/app/manifest/utils/from-logic-function-config-to-logic-function-manifest';
import { fromFrontComponentConfigToFrontComponentManifest } from '@/app/manifest/utils/from-front-component-config-to-front-component-manifest';
import { listApplicationSourceFiles } from '@/app/source/list-application-source-files';
import { type EntityFilePaths } from '@/app/manifest/types/entity-file-paths.type';
import {
  extractDefineEntity,
  DEFINE_ENTITY_KEYS,
} from '@/app/source/extract-define-entity';
import { extractManifestFromFile } from '@/app/source/extract-manifest-from-file';
import { addMissingFieldOptionIds } from '@/app/manifest/utils/add-missing-field-option-ids';
import { fromRoleConfigToRoleManifest } from '@/app/manifest/utils/from-role-config-to-role-manifest';
import { extractFrontComponentSharedDependencies } from '@/app/manifest/utils/extract-front-component-shared-dependencies';
import { validateConditionalAvailabilityUsage } from '@/app/manifest/utils/validate-conditional-availability-usage';
import { validateAgentRolesWithinApplicationRole } from '@/app/manifest/utils/validate-agent-roles-within-application-role';
import { validateViewFilterOperands } from '@/app/manifest/utils/validate-view-filter-operands';
import { getEngineVersionRange } from '@/app/manifest/get-engine-version-range';
import { type ApplicationConfig } from '@/app/manifest/types/application-config.type';
import { type LogicFunctionConfig } from '@/app/manifest/types/logic-function-config.type';
import { type CommandMenuItemConfig } from '@/app/manifest/types/command-menu-item-config.type';
import { type FrontComponentConfig } from '@/app/manifest/types/front-component-config.type';
import { type IndexConfig } from '@/app/manifest/types/index-config.type';
import { type PostInstallLogicFunctionConfig } from '@/app/manifest/types/post-install-logic-function-config.type';
import { type PreInstallLogicFunctionConfig } from '@/app/manifest/types/pre-install-logic-function-config.type';
import { type ObjectConfig } from '@/app/manifest/types/object-config.type';
import { type PageLayoutConfig } from '@/app/manifest/types/page-layout-config.type';
import { type PageLayoutTabConfig } from '@/app/manifest/types/page-layout-tab-config.type';
import { type RoleConfig } from '@/app/manifest/types/role-config.type';
import { type TimelineActivityTypeConfig } from '@/app/manifest/types/timeline-activity-type-config.type';
import { type SettingsMenuItemConfig } from '@/app/manifest/types/settings-menu-item-config.type';
import { type ViewConfig } from '@/app/manifest/types/view-config.type';
import { readFile } from 'node:fs/promises';
import { basename, extname, join, relative } from 'path';
import { glob } from 'tinyglobby';
import {
  type AgentManifest,
  type ApplicationManifest,
  type AssetManifest,
  ASSETS_DIR,
  type CommandMenuItemManifest,
  type ConnectionProviderManifest,
  type FieldManifest,
  type FrontComponentManifest,
  type IndexManifest,
  type LogicFunctionManifest,
  type Manifest,
  type NavigationMenuItemManifest,
  type ObjectManifest,
  type PageLayoutManifest,
  type PageLayoutTabManifest,
  type PermissionFlagManifest,
  type PostInstallLogicFunctionApplicationManifest,
  type PreInstallLogicFunctionApplicationManifest,
  type UninstallLogicFunctionApplicationManifest,
  type HealthCheckLogicFunctionApplicationManifest,
  type RoleManifest,
  type SkillManifest,
  type StandalonePageLayoutWidgetManifest,
  type StandaloneViewFieldManifest,
  type SettingsMenuItemManifest,
  type TimelineActivityTypeManifest,
  type ViewManifest,
  type WorkflowManifest,
} from 'twenty-shared/application';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

const loadSources = (appPath: string): Promise<string[]> =>
  listApplicationSourceFiles(appPath);

const loadAssets = async (appPath: string) => {
  const assetPaths = await glob([`${ASSETS_DIR}/**/*`], {
    cwd: appPath,
    absolute: true,
    onlyFiles: true,
  });

  return assetPaths.sort();
};

const loadReadme = async (appPath: string): Promise<string | undefined> => {
  try {
    const content = await readFile(join(appPath, 'README.md'), 'utf-8');

    return content.trim().length > 0 ? content : undefined;
  } catch {
    return undefined;
  }
};

export const buildManifest = async (
  appPath: string,
): Promise<{
  manifest: Manifest | null;
  filePaths: EntityFilePaths;
  errors: string[];
  warnings: string[];
}> => {
  const filePaths = await loadSources(appPath);
  const readmeContent = await loadReadme(appPath);
  const errors: string[] = [];
  const warnings: string[] = [];

  let applicationConfig: ApplicationConfig | undefined;
  const objectConfigs: ObjectConfig[] = [];
  const roleConfigs: RoleConfig[] = [];
  const objects: ObjectManifest[] = [];
  const fields: FieldManifest[] = [];
  const indexes: IndexManifest[] = [];
  const permissionFlags: PermissionFlagManifest[] = [];
  const roles: RoleManifest[] = [];
  const skills: SkillManifest[] = [];
  const agents: AgentManifest[] = [];
  const workflows: WorkflowManifest[] = [];
  const connectionProviders: ConnectionProviderManifest[] = [];
  const logicFunctions: LogicFunctionManifest[] = [];
  const frontComponents: FrontComponentManifest[] = [];
  const publicAssets: AssetManifest[] = [];
  const views: ViewManifest[] = [];
  const viewFields: StandaloneViewFieldManifest[] = [];
  const navigationMenuItems: NavigationMenuItemManifest[] = [];
  const pageLayouts: PageLayoutManifest[] = [];
  const pageLayoutTabs: PageLayoutTabManifest[] = [];
  const pageLayoutWidgets: StandalonePageLayoutWidgetManifest[] = [];
  const commandMenuItems: CommandMenuItemManifest[] = [];
  const timelineActivityTypes: TimelineActivityTypeManifest[] = [];
  const settingsMenuItems: SettingsMenuItemManifest[] = [];
  const postInstallLogicFunctions: PostInstallLogicFunctionApplicationManifest[] =
    [];
  const preInstallLogicFunctions: PreInstallLogicFunctionApplicationManifest[] =
    [];
  const uninstallLogicFunctions: UninstallLogicFunctionApplicationManifest[] =
    [];
  const healthCheckLogicFunctions: HealthCheckLogicFunctionApplicationManifest[] =
    [];
  const settingsFrontComponentUniversalIdentifiers: string[] = [];
  const applicationRoleUniversalIdentifiers: string[] = [];
  const applicationFilePaths: string[] = [];
  const objectsFilePaths: string[] = [];
  const fieldsFilePaths: string[] = [];
  const indexesFilePaths: string[] = [];
  const permissionFlagsFilePaths: string[] = [];
  const rolesFilePaths: string[] = [];
  const skillsFilePaths: string[] = [];
  const agentsFilePaths: string[] = [];
  const workflowsFilePaths: string[] = [];
  const connectionProvidersFilePaths: string[] = [];
  const logicFunctionsFilePaths: string[] = [];
  const frontComponentsFilePaths: string[] = [];
  const publicAssetsFilePaths: string[] = [];
  const viewsFilePaths: string[] = [];
  const viewFieldsFilePaths: string[] = [];
  const navigationMenuItemsFilePaths: string[] = [];
  const pageLayoutsFilePaths: string[] = [];
  const pageLayoutTabsFilePaths: string[] = [];
  const pageLayoutWidgetsFilePaths: string[] = [];
  const commandMenuItemsFilePaths: string[] = [];
  const timelineActivityTypesFilePaths: string[] = [];
  const settingsMenuItemsFilePaths: string[] = [];

  for (const filePath of filePaths) {
    const fileContent = await readFile(filePath, 'utf-8');
    const relativePath = relative(appPath, filePath);

    errors.push(
      ...validateConditionalAvailabilityUsage(fileContent, relativePath),
    );

    const targetFunctionName = extractDefineEntity(fileContent);

    if (!targetFunctionName) {
      continue;
    }

    const entity = DEFINE_ENTITY_KEYS[targetFunctionName];

    switch (entity) {
      case 'application': {
        const extract = await extractManifestFromFile<ApplicationConfig>({
          appPath,
          filePath,
        });

        applicationConfig = extract.config;
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        applicationFilePaths.push(relativePath);
        break;
      }
      case 'objects': {
        const extract = await extractManifestFromFile<ObjectConfig>({
          appPath,
          filePath,
        });

        objectConfigs.push(extract.config);

        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        objectsFilePaths.push(relativePath);
        break;
      }
      case 'fields': {
        const extract = await extractManifestFromFile<FieldManifest>({
          appPath,
          filePath,
        });
        const fieldConfig = addMissingFieldOptionIds(extract.config);
        fields.push(fieldConfig);
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        fieldsFilePaths.push(relativePath);
        break;
      }
      case 'permissionFlags': {
        const extract = await extractManifestFromFile<PermissionFlagManifest>({
          appPath,
          filePath,
        });
        permissionFlags.push(extract.config);
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        permissionFlagsFilePaths.push(relativePath);
        break;
      }
      case 'roles': {
        const extract = await extractManifestFromFile<RoleConfig>({
          appPath,
          filePath,
        });
        roleConfigs.push(extract.config);
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        rolesFilePaths.push(relativePath);

        if (targetFunctionName === 'defineApplicationRole') {
          applicationRoleUniversalIdentifiers.push(
            extract.config.universalIdentifier,
          );
        }

        break;
      }
      case 'skills': {
        const extract = await extractManifestFromFile<SkillManifest>({
          appPath,
          filePath,
        });
        skills.push(extract.config);
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        skillsFilePaths.push(relativePath);
        break;
      }
      case 'agents': {
        const extract = await extractManifestFromFile<AgentManifest>({
          appPath,
          filePath,
        });
        agents.push(extract.config);
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        agentsFilePaths.push(relativePath);
        break;
      }
      case 'workflows': {
        const extract = await extractManifestFromFile<WorkflowManifest>({
          appPath,
          filePath,
        });
        workflows.push(extract.config);
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        workflowsFilePaths.push(relativePath);
        break;
      }
      case 'connectionProviders': {
        const extract =
          await extractManifestFromFile<ConnectionProviderManifest>({
            appPath,
            filePath,
          });
        connectionProviders.push(extract.config);
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        connectionProvidersFilePaths.push(relativePath);
        break;
      }
      case 'logicFunctions': {
        const extract = await extractManifestFromFile<LogicFunctionConfig>({
          appPath,
          filePath,
        });

        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));

        if (
          targetFunctionName === 'definePreInstallLogicFunction' &&
          isDefined(extract.config.serverRouteTriggerSettings)
        ) {
          errors.push(
            `${relativePath}: pre-install logic functions cannot define serverRouteTriggerSettings.`,
          );
        }

        const config = await fromLogicFunctionConfigToLogicFunctionManifest({
          logicFunctionConfig: extract.config,
          sourceCode: fileContent,
          sourcePath: relativePath,
        });

        logicFunctions.push(config);
        logicFunctionsFilePaths.push(relativePath);

        if (targetFunctionName === 'definePostInstallLogicFunction') {
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

        if (targetFunctionName === 'definePreInstallLogicFunction') {
          const preInstallHookConfig =
            extract.config as PreInstallLogicFunctionConfig;

          preInstallLogicFunctions.push({
            universalIdentifier: extract.config.universalIdentifier,
            shouldRunOnVersionUpgrade:
              preInstallHookConfig.shouldRunOnVersionUpgrade ?? false,
          });
        }

        if (targetFunctionName === 'defineUninstallLogicFunction') {
          uninstallLogicFunctions.push({
            universalIdentifier: extract.config.universalIdentifier,
          });
        }

        if (targetFunctionName === 'defineHealthCheck') {
          healthCheckLogicFunctions.push({
            universalIdentifier: extract.config.universalIdentifier,
          });
        }

        break;
      }
      case 'frontComponents': {
        const extract = await extractManifestFromFile<FrontComponentConfig>({
          appPath,
          filePath,
        });

        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));

        const config = fromFrontComponentConfigToFrontComponentManifest({
          frontComponentConfig: extract.config,
          sourcePath: relativePath,
        });

        frontComponents.push(config);
        frontComponentsFilePaths.push(relativePath);

        if (targetFunctionName === 'defineSettingsFrontComponent') {
          settingsFrontComponentUniversalIdentifiers.push(
            extract.config.universalIdentifier,
          );
        }

        break;
      }
      case 'views': {
        const extract = await extractManifestFromFile<ViewConfig>({
          appPath,
          filePath,
        });

        const viewManifest: ViewManifest = {
          ...extract.config,
        };

        views.push(viewManifest);
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        viewsFilePaths.push(relativePath);
        break;
      }
      case 'viewFields': {
        const extract =
          await extractManifestFromFile<StandaloneViewFieldManifest>({
            appPath,
            filePath,
          });

        viewFields.push(extract.config);
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        viewFieldsFilePaths.push(relativePath);
        break;
      }
      case 'navigationMenuItems': {
        const extract =
          await extractManifestFromFile<NavigationMenuItemManifest>({
            appPath,
            filePath,
          });
        navigationMenuItems.push(extract.config);
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        navigationMenuItemsFilePaths.push(relativePath);
        break;
      }
      case 'pageLayouts': {
        const extract = await extractManifestFromFile<PageLayoutConfig>({
          appPath,
          filePath,
        });

        const pageLayoutManifest: PageLayoutManifest = {
          ...extract.config,
        };

        pageLayouts.push(pageLayoutManifest);
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        pageLayoutsFilePaths.push(relativePath);
        break;
      }
      case 'indexes': {
        const extract = await extractManifestFromFile<IndexConfig>({
          appPath,
          filePath,
        });

        const indexManifest: IndexManifest = {
          ...extract.config,
        };

        indexes.push(indexManifest);
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        indexesFilePaths.push(relativePath);
        break;
      }
      case 'pageLayoutTabs': {
        const extract = await extractManifestFromFile<PageLayoutTabConfig>({
          appPath,
          filePath,
        });

        const pageLayoutTabManifest: PageLayoutTabManifest = {
          ...extract.config,
        };

        pageLayoutTabs.push(pageLayoutTabManifest);
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        pageLayoutTabsFilePaths.push(relativePath);
        break;
      }
      case 'pageLayoutWidgets': {
        const extract =
          await extractManifestFromFile<StandalonePageLayoutWidgetManifest>({
            appPath,
            filePath,
          });

        pageLayoutWidgets.push(extract.config);
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        pageLayoutWidgetsFilePaths.push(relativePath);
        break;
      }
      case 'commandMenuItems': {
        const extract = await extractManifestFromFile<CommandMenuItemConfig>({
          appPath,
          filePath,
        });

        commandMenuItems.push(
          extract.config as unknown as CommandMenuItemManifest,
        );
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        commandMenuItemsFilePaths.push(relativePath);
        break;
      }
      case 'timelineActivityTypes': {
        const extract =
          await extractManifestFromFile<TimelineActivityTypeConfig>({
            appPath,
            filePath,
          });

        timelineActivityTypes.push(extract.config);
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        timelineActivityTypesFilePaths.push(relativePath);
        break;
      }
      case 'settingsMenuItems': {
        const extract = await extractManifestFromFile<SettingsMenuItemConfig>({
          appPath,
          filePath,
        });

        settingsMenuItems.push(extract.config);
        errors.push(...extract.errors);
        warnings.push(...(extract.warnings ?? []));
        settingsMenuItemsFilePaths.push(relativePath);
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

  if (!applicationConfig) {
    errors.push(
      'Cannot build application, please export default defineApplication() to define an application',
    );
  }

  if (applicationConfig) {
    for (const objectConfig of objectConfigs) {
      const { objectManifest, errors: objectErrors } =
        fromObjectConfigToObjectManifest({
          objectConfig,
          applicationUniversalIdentifier: applicationConfig.universalIdentifier,
        });

      errors.push(...objectErrors);

      if (!objectManifest) {
        continue;
      }

      objects.push(objectManifest);
    }

    for (const roleConfig of roleConfigs) {
      roles.push(
        fromRoleConfigToRoleManifest({
          roleConfig,
          applicationUniversalIdentifier: applicationConfig.universalIdentifier,
        }),
      );
    }
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

  if (uninstallLogicFunctions.length > 1) {
    errors.push('Only one uninstall logic function is allowed per application');
  }

  if (healthCheckLogicFunctions.length > 1) {
    errors.push('Only one health check is allowed per application');
  }

  if (settingsFrontComponentUniversalIdentifiers.length > 1) {
    errors.push('Only one settings front component is allowed per application');
  }

  if (applicationRoleUniversalIdentifiers.length > 1) {
    errors.push('Only one defineApplicationRole is allowed per application');
  }

  const { sharedDependencies, errors: sharedDependenciesErrors } =
    await extractFrontComponentSharedDependencies(appPath);

  errors.push(...sharedDependenciesErrors);

  const resolvedDefaultRoleUniversalIdentifier =
    applicationConfig?.defaultRoleUniversalIdentifier ??
    (applicationRoleUniversalIdentifiers.length === 1
      ? applicationRoleUniversalIdentifiers[0]
      : undefined);

  if (applicationConfig && !resolvedDefaultRoleUniversalIdentifier) {
    errors.push(
      'Application must declare a default role: either pass `defaultRoleUniversalIdentifier` to defineApplication() or mark a role file with defineApplicationRole()',
    );
  }

  errors.push(
    ...validateViewFilterOperands({
      views,
      objects,
      fields,
    }),
  );

  if (
    isDefined(applicationConfig) &&
    isDefined(resolvedDefaultRoleUniversalIdentifier)
  ) {
    errors.push(
      ...validateAgentRolesWithinApplicationRole({
        agents,
        roles,
        objects,
        permissionFlags,
        defaultRoleUniversalIdentifier: resolvedDefaultRoleUniversalIdentifier,
      }),
    );
  }

  const application: ApplicationManifest | undefined =
    applicationConfig && resolvedDefaultRoleUniversalIdentifier
      ? (() => {
          const {
            logoUrl: _logoUrl,
            screenshots: _screenshots,
            ...applicationConfigRest
          } = applicationConfig;

          return {
            ...applicationConfigRest,
            logo: applicationConfig.logo,
            galleryImages: applicationConfig.galleryImages ?? [],
            defaultRoleUniversalIdentifier:
              resolvedDefaultRoleUniversalIdentifier,
            aboutDescription: readmeContent,
            yarnLockChecksum: null,
            packageJsonChecksum: null,
            requiredServerVersionRange: getEngineVersionRange(appPath),
            ...(postInstallLogicFunctions.length >= 1
              ? { postInstallLogicFunction: postInstallLogicFunctions[0] }
              : {}),
            ...(preInstallLogicFunctions.length >= 1
              ? { preInstallLogicFunction: preInstallLogicFunctions[0] }
              : {}),
            ...(uninstallLogicFunctions.length >= 1
              ? { uninstallLogicFunction: uninstallLogicFunctions[0] }
              : {}),
            ...(healthCheckLogicFunctions.length >= 1
              ? { healthCheckLogicFunction: healthCheckLogicFunctions[0] }
              : {}),
            ...(settingsFrontComponentUniversalIdentifiers.length >= 1
              ? {
                  settingsFrontComponent: {
                    universalIdentifier:
                      settingsFrontComponentUniversalIdentifiers[0],
                  },
                }
              : {}),
            ...(isDefined(sharedDependencies)
              ? { frontComponentSharedDependencies: sharedDependencies }
              : {}),
          };
        })()
      : undefined;

  const byId = <TEntity extends { universalIdentifier: string }>(
    a: TEntity,
    b: TEntity,
  ) => a.universalIdentifier.localeCompare(b.universalIdentifier);

  const byPath = <TEntity extends { filePath: string }>(
    a: TEntity,
    b: TEntity,
  ) => a.filePath.localeCompare(b.filePath);

  const manifest: Manifest | null = !application
    ? null
    : {
        application,
        objects: objects.sort(byId),
        fields: fields.sort(byId),
        indexes: indexes.sort(byId),
        permissionFlags: permissionFlags.sort(byId),
        roles: roles.sort(byId),
        skills: skills.sort(byId),
        agents: agents.sort(byId),
        workflows: workflows.sort(byId),
        connectionProviders: connectionProviders.sort(byId),
        logicFunctions: logicFunctions.sort(byId),
        frontComponents: frontComponents.sort(byId),
        publicAssets: publicAssets.sort(byPath),
        views: views.sort(byId),
        viewFields: viewFields.sort(byId),
        navigationMenuItems: navigationMenuItems.sort(byId),
        pageLayouts: pageLayouts.sort(byId),
        pageLayoutTabs: pageLayoutTabs.sort(byId),
        pageLayoutWidgets: pageLayoutWidgets.sort(byId),
        commandMenuItems: commandMenuItems.sort(byId),
        timelineActivityTypes: timelineActivityTypes.sort(byId),
        settingsMenuItems: settingsMenuItems.sort(byId),
      };

  const entityFilePaths: EntityFilePaths = {
    application: applicationFilePaths,
    objects: objectsFilePaths,
    fields: fieldsFilePaths,
    indexes: indexesFilePaths,
    permissionFlags: permissionFlagsFilePaths,
    roles: rolesFilePaths,
    skills: skillsFilePaths,
    agents: agentsFilePaths,
    workflows: workflowsFilePaths,
    connectionProviders: connectionProvidersFilePaths,
    logicFunctions: logicFunctionsFilePaths,
    frontComponents: frontComponentsFilePaths,
    publicAssets: publicAssetsFilePaths,
    views: viewsFilePaths,
    viewFields: viewFieldsFilePaths,
    navigationMenuItems: navigationMenuItemsFilePaths,
    pageLayouts: pageLayoutsFilePaths,
    pageLayoutTabs: pageLayoutTabsFilePaths,
    pageLayoutWidgets: pageLayoutWidgetsFilePaths,
    commandMenuItems: commandMenuItemsFilePaths,
    timelineActivityTypes: timelineActivityTypesFilePaths,
    settingsMenuItems: settingsMenuItemsFilePaths,
  };

  return { manifest, filePaths: entityFilePaths, errors, warnings };
};
