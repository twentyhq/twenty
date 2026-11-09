import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationContentDTO } from 'src/engine/core-modules/application/application-content/dtos/application-content.dto';
import { DEFAULT_LOGIC_FUNCTION_TIMEOUT_SECONDS } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { buildPublicAssetContentItem } from 'src/engine/core-modules/application/application-content/utils/build-public-asset-content-item.util';
import { buildTranslationContentItems } from 'src/engine/core-modules/application/application-content/utils/build-translation-content-items.util';
import { countByKey } from 'src/engine/core-modules/application/application-content/utils/count-by-key.util';
import { getNavigationMenuItemContentLabel } from 'src/engine/core-modules/application/application-content/utils/get-navigation-menu-item-content-label.util';
import { findByUniversalIdentifier } from 'src/engine/core-modules/application/application-content/utils/find-by-universal-identifier.util';
import { mapByUniversalIdentifier } from 'src/engine/core-modules/application/application-content/utils/map-by-universal-identifier.util';
import { getLogicFunctionTriggerTag } from 'src/engine/core-modules/application/application-content/utils/get-logic-function-trigger-tag.util';

export const buildApplicationContentFromManifest = (
  manifest: Partial<Omit<Manifest, 'application'>>,
): ApplicationContentDTO => {
  const objects = manifest.objects ?? [];

  const fields = [
    ...objects.flatMap((object) =>
      (object.fields ?? []).map((field) => ({
        ...field,
        objectUniversalIdentifier: object.universalIdentifier,
      })),
    ),
    ...(manifest.fields ?? []),
  ];

  const views = manifest.views ?? [];

  const viewFields = [
    ...views.flatMap((view) =>
      (view.fields ?? []).map((viewField) => ({
        ...viewField,
        viewUniversalIdentifier: view.universalIdentifier,
      })),
    ),
    ...(manifest.viewFields ?? []),
  ];

  const pageLayouts = manifest.pageLayouts ?? [];

  const pageLayoutTabs = [
    ...pageLayouts.flatMap((pageLayout) =>
      (pageLayout.tabs ?? []).map((tab) => ({
        ...tab,
        pageLayoutUniversalIdentifier: pageLayout.universalIdentifier,
      })),
    ),
    ...(manifest.pageLayoutTabs ?? []),
  ];

  const pageLayoutWidgets = [
    ...pageLayoutTabs.flatMap((tab) =>
      (tab.widgets ?? []).map((widget) => ({
        ...widget,
        pageLayoutTabUniversalIdentifier: tab.universalIdentifier,
      })),
    ),
    ...(manifest.pageLayoutWidgets ?? []),
  ];

  const navigationMenuItems = manifest.navigationMenuItems ?? [];
  const commandMenuItems = manifest.commandMenuItems ?? [];

  const fieldCountByObject = countByKey({
    items: fields,
    getKey: (field) => field.objectUniversalIdentifier,
  });
  const viewFieldCountByView = countByKey({
    items: viewFields,
    getKey: (viewField) => viewField.viewUniversalIdentifier,
  });
  const listedViewUniversalIdentifiers = new Set(
    views.map((view) => view.universalIdentifier),
  );
  const viewCountByField = countByKey({
    items: viewFields.filter((viewField) =>
      listedViewUniversalIdentifiers.has(viewField.viewUniversalIdentifier),
    ),
    getKey: (viewField) => viewField.fieldMetadataUniversalIdentifier,
  });
  const tabCountByPageLayout = countByKey({
    items: pageLayoutTabs,
    getKey: (tab) => tab.pageLayoutUniversalIdentifier,
  });
  const widgetCountByTab = countByKey({
    items: pageLayoutWidgets,
    getKey: (widget) => widget.pageLayoutTabUniversalIdentifier,
  });
  const placementCountByFrontComponent = countByKey({
    items: [
      ...commandMenuItems.map(
        (commandMenuItem) => commandMenuItem.frontComponentUniversalIdentifier,
      ),
      ...pageLayoutWidgets.map((widget) =>
        'frontComponentUniversalIdentifier' in widget.configuration
          ? widget.configuration.frontComponentUniversalIdentifier
          : undefined,
      ),
    ],
    getKey: (frontComponentUniversalIdentifier) =>
      frontComponentUniversalIdentifier,
  });

  const viewNameByUniversalIdentifier = mapByUniversalIdentifier({
    items: views,
    getValue: (view) => view.name,
  });
  const viewObjectByUniversalIdentifier = mapByUniversalIdentifier({
    items: views,
    getValue: (view) => view.objectUniversalIdentifier,
  });
  const pageLayoutNameByUniversalIdentifier = mapByUniversalIdentifier({
    items: pageLayouts,
    getValue: (pageLayout) => pageLayout.name,
  });
  const navigationMenuItemNameByUniversalIdentifier = mapByUniversalIdentifier({
    items: navigationMenuItems,
    getValue: (navigationMenuItem) => navigationMenuItem.name,
  });
  const objectLabelByUniversalIdentifier = mapByUniversalIdentifier({
    items: objects,
    getValue: (object) => object.labelPlural,
  });
  const fieldLabelByUniversalIdentifier = mapByUniversalIdentifier({
    items: fields,
    getValue: (field) => field.label,
  });

  const roles = manifest.roles ?? [];
  const roleCountByPermissionFlag = countByKey({
    items: roles.flatMap(
      (role) => role.permissionFlagUniversalIdentifiers ?? [],
    ),
    getKey: (permissionFlag) => permissionFlag,
  });

  return {
    objects: objects.map((object) => ({
      universalIdentifier: object.universalIdentifier,
      label: object.labelPlural,
      icon: object.icon,
      color: object.color,
      description: object.description,
      count: fieldCountByObject.get(object.universalIdentifier) ?? 0,
    })),
    fields: fields.map((field) => ({
      universalIdentifier: field.universalIdentifier,
      label: field.label,
      icon: field.icon,
      description: field.description,
      objectUniversalIdentifier: field.objectUniversalIdentifier,
      tag: field.type,
      count: viewCountByField.get(field.universalIdentifier) ?? 0,
    })),
    indexes: (manifest.indexes ?? []).map((index) => ({
      universalIdentifier: index.universalIdentifier,
      label: index.fields
        .map(
          (indexField) =>
            fieldLabelByUniversalIdentifier.get(
              indexField.fieldUniversalIdentifier,
            ) ?? indexField.fieldUniversalIdentifier,
        )
        .join(', '),
      objectUniversalIdentifier: index.objectUniversalIdentifier,
      tag: index.isUnique ? 'UNIQUE' : null,
      count: index.fields.length,
    })),
    views: views.map((view) => ({
      universalIdentifier: view.universalIdentifier,
      label: view.name,
      icon: view.icon,
      objectUniversalIdentifier: view.objectUniversalIdentifier,
      tag: view.type,
      count: viewFieldCountByView.get(view.universalIdentifier) ?? 0,
    })),
    viewFields: viewFields.map((viewField) => ({
      universalIdentifier: viewField.universalIdentifier,
      label:
        fieldLabelByUniversalIdentifier.get(
          viewField.fieldMetadataUniversalIdentifier,
        ) ?? viewField.fieldMetadataUniversalIdentifier,
      parentLabel: viewNameByUniversalIdentifier.get(
        viewField.viewUniversalIdentifier,
      ),
      parentUniversalIdentifier: viewField.viewUniversalIdentifier,
      fieldUniversalIdentifier: viewField.fieldMetadataUniversalIdentifier,
      position: viewField.position,
    })),
    pageLayouts: pageLayouts.map((pageLayout) => ({
      universalIdentifier: pageLayout.universalIdentifier,
      label: pageLayout.name,
      objectUniversalIdentifier: pageLayout.objectUniversalIdentifier,
      tag: pageLayout.type,
      count: tabCountByPageLayout.get(pageLayout.universalIdentifier) ?? 0,
    })),
    pageLayoutTabs: pageLayoutTabs.map((tab) => ({
      universalIdentifier: tab.universalIdentifier,
      label: tab.title,
      icon: tab.icon,
      parentLabel: isDefined(tab.pageLayoutUniversalIdentifier)
        ? pageLayoutNameByUniversalIdentifier.get(
            tab.pageLayoutUniversalIdentifier,
          )
        : null,
      parentUniversalIdentifier: tab.pageLayoutUniversalIdentifier,
      count: widgetCountByTab.get(tab.universalIdentifier) ?? 0,
    })),
    navigationMenuItems: navigationMenuItems.map((navigationMenuItem) => ({
      universalIdentifier: navigationMenuItem.universalIdentifier,
      label: getNavigationMenuItemContentLabel({
        name: navigationMenuItem.name,
        viewName: findByUniversalIdentifier({
          valueByUniversalIdentifier: viewNameByUniversalIdentifier,
          universalIdentifier: navigationMenuItem.viewUniversalIdentifier,
        }),
        objectLabel: findByUniversalIdentifier({
          valueByUniversalIdentifier: objectLabelByUniversalIdentifier,
          universalIdentifier:
            navigationMenuItem.targetObjectUniversalIdentifier,
        }),
        link: navigationMenuItem.link,
        type: navigationMenuItem.type,
      }),
      icon: navigationMenuItem.icon,
      color: navigationMenuItem.color,
      objectUniversalIdentifier:
        navigationMenuItem.targetObjectUniversalIdentifier ??
        findByUniversalIdentifier({
          valueByUniversalIdentifier: viewObjectByUniversalIdentifier,
          universalIdentifier: navigationMenuItem.viewUniversalIdentifier,
        }),
      parentLabel: findByUniversalIdentifier({
        valueByUniversalIdentifier: navigationMenuItemNameByUniversalIdentifier,
        universalIdentifier: navigationMenuItem.folderUniversalIdentifier,
      }),
      parentUniversalIdentifier: navigationMenuItem.folderUniversalIdentifier,
      tag: navigationMenuItem.type,
      position: navigationMenuItem.position,
    })),
    commandMenuItems: commandMenuItems.map((commandMenuItem) => ({
      universalIdentifier: commandMenuItem.universalIdentifier,
      label: commandMenuItem.label,
      icon: commandMenuItem.icon,
      objectUniversalIdentifier:
        commandMenuItem.availabilityObjectUniversalIdentifier,
      tag: commandMenuItem.availabilityType,
    })),
    frontComponents: (manifest.frontComponents ?? []).map((frontComponent) => ({
      universalIdentifier: frontComponent.universalIdentifier,
      label: frontComponent.name ?? frontComponent.componentName,
      description: frontComponent.description,
      tag: isDefined(frontComponent.widgetAvailability)
        ? 'WIDGET'
        : 'FRONT_COMPONENT',
      count:
        placementCountByFrontComponent.get(
          frontComponent.universalIdentifier,
        ) ?? 0,
    })),
    workflows: (manifest.workflows ?? []).map((workflow) => ({
      universalIdentifier: workflow.universalIdentifier,
      label: workflow.name,
      tag: 'ACTIVE',
    })),
    logicFunctions: (manifest.logicFunctions ?? []).map((logicFunction) => ({
      universalIdentifier: logicFunction.universalIdentifier,
      label: logicFunction.name ?? logicFunction.handlerName,
      description: logicFunction.description,
      tag: getLogicFunctionTriggerTag(logicFunction),
      timeoutSeconds:
        logicFunction.timeoutSeconds ?? DEFAULT_LOGIC_FUNCTION_TIMEOUT_SECONDS,
    })),
    agents: (manifest.agents ?? []).map((agent) => ({
      universalIdentifier: agent.universalIdentifier,
      label: agent.label,
      icon: agent.icon,
      description: agent.description,
    })),
    skills: (manifest.skills ?? []).map((skill) => ({
      universalIdentifier: skill.universalIdentifier,
      label: skill.label,
      icon: skill.icon,
      description: skill.description,
    })),
    roles: roles.map((role) => ({
      universalIdentifier: role.universalIdentifier,
      label: role.label,
      icon: role.icon,
      description: role.description,
    })),
    permissionFlags: (manifest.permissionFlags ?? []).map((permissionFlag) => ({
      universalIdentifier: permissionFlag.universalIdentifier,
      label: permissionFlag.label,
      icon: permissionFlag.icon,
      description: permissionFlag.description,
      tag: permissionFlag.permissionType ?? 'settings',
      count:
        roleCountByPermissionFlag.get(permissionFlag.universalIdentifier) ?? 0,
    })),
    connectionProviders: (manifest.connectionProviders ?? []).map(
      (connectionProvider) => ({
        universalIdentifier: connectionProvider.universalIdentifier,
        label: connectionProvider.displayName,
        tag: connectionProvider.type,
      }),
    ),
    publicAssets: (manifest.publicAssets ?? []).map(
      buildPublicAssetContentItem,
    ),
    translations: buildTranslationContentItems(manifest.translations ?? {}),
  };
};
