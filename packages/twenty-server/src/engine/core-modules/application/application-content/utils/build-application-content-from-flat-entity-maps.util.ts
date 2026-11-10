import { ViewVisibility, WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationContentDTO } from 'src/engine/core-modules/application/application-content/dtos/application-content.dto';
import { countByKey } from 'src/engine/core-modules/application/application-content/utils/count-by-key.util';
import { findByUniversalIdentifier } from 'src/engine/core-modules/application/application-content/utils/find-by-universal-identifier.util';
import { getNavigationMenuItemContentLabel } from 'src/engine/core-modules/application/application-content/utils/get-navigation-menu-item-content-label.util';
import { getLogicFunctionTriggerTag } from 'src/engine/core-modules/application/application-content/utils/get-logic-function-trigger-tag.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entities-by-application-id.util';

export type ApplicationContentFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  | 'flatObjectMetadataMaps'
  | 'flatFieldMetadataMaps'
  | 'flatIndexMaps'
  | 'flatViewMaps'
  | 'flatViewFieldMaps'
  | 'flatPageLayoutMaps'
  | 'flatPageLayoutTabMaps'
  | 'flatPageLayoutWidgetMaps'
  | 'flatNavigationMenuItemMaps'
  | 'flatCommandMenuItemMaps'
  | 'flatFrontComponentMaps'
  | 'flatWorkflowMaps'
  | 'flatWorkflowVersionMaps'
  | 'flatLogicFunctionMaps'
  | 'flatAgentMaps'
  | 'flatSkillMaps'
  | 'flatRoleMaps'
  | 'flatRoleTargetMaps'
  | 'flatPermissionFlagMaps'
  | 'flatRolePermissionFlagMaps'
  | 'flatConnectionProviderMaps'
>;

export const APPLICATION_CONTENT_FLAT_ENTITY_MAPS_KEYS = [
  'flatObjectMetadataMaps',
  'flatFieldMetadataMaps',
  'flatIndexMaps',
  'flatViewMaps',
  'flatViewFieldMaps',
  'flatPageLayoutMaps',
  'flatPageLayoutTabMaps',
  'flatPageLayoutWidgetMaps',
  'flatNavigationMenuItemMaps',
  'flatCommandMenuItemMaps',
  'flatFrontComponentMaps',
  'flatWorkflowMaps',
  'flatWorkflowVersionMaps',
  'flatLogicFunctionMaps',
  'flatAgentMaps',
  'flatSkillMaps',
  'flatRoleMaps',
  'flatRoleTargetMaps',
  'flatPermissionFlagMaps',
  'flatRolePermissionFlagMaps',
  'flatConnectionProviderMaps',
] as const satisfies (keyof ApplicationContentFlatEntityMaps)[];

// Workspace caches load soft-deleted rows too
const isSoftDeletedFlatEntity = (flatEntity: object) =>
  'deletedAt' in flatEntity && isDefined(flatEntity.deletedAt);

const isPersonalNavigationMenuItem = (navigationMenuItem: {
  userWorkspaceId: string | null;
}) => isDefined(navigationMenuItem.userWorkspaceId);

const isPersonalView = (view: {
  visibility: ViewVisibility;
  createdByUserWorkspaceId: string | null;
}) =>
  view.visibility === ViewVisibility.UNLISTED &&
  isDefined(view.createdByUserWorkspaceId);

export const buildApplicationContentFromFlatEntityMaps = ({
  applicationId,
  flatEntityMaps,
}: {
  applicationId: string;
  flatEntityMaps: ApplicationContentFlatEntityMaps;
}): ApplicationContentDTO => {
  const findOwned = <TFlatEntity extends SyncableFlatEntity>(
    maps: FlatEntityMaps<TFlatEntity>,
  ): TFlatEntity[] =>
    findFlatEntitiesByApplicationId({
      applicationId,
      flatEntityMaps: maps,
    }).filter((flatEntity) => !isSoftDeletedFlatEntity(flatEntity));

  const objects = findOwned(flatEntityMaps.flatObjectMetadataMaps).filter(
    (object) => !object.isSystem,
  );
  const fields = findOwned(flatEntityMaps.flatFieldMetadataMaps).filter(
    (field) => !field.isSystem && !field.isSystemSideEffect,
  );
  const indexes = findOwned(flatEntityMaps.flatIndexMaps).filter(
    (index) => !index.isSystemSideEffect,
  );
  const ownedViews = findOwned(flatEntityMaps.flatViewMaps);
  const personalViewUniversalIdentifiers = new Set(
    ownedViews.filter(isPersonalView).map((view) => view.universalIdentifier),
  );
  const views = ownedViews.filter(
    (view) =>
      !view.isSystemSideEffect &&
      !personalViewUniversalIdentifiers.has(view.universalIdentifier),
  );
  const viewFields = findOwned(flatEntityMaps.flatViewFieldMaps).filter(
    (viewField) =>
      !viewField.isSystemSideEffect &&
      !personalViewUniversalIdentifiers.has(viewField.viewUniversalIdentifier),
  );
  const pageLayouts = findOwned(flatEntityMaps.flatPageLayoutMaps).filter(
    (pageLayout) => !pageLayout.isSystemSideEffect,
  );
  const pageLayoutTabs = findOwned(flatEntityMaps.flatPageLayoutTabMaps).filter(
    (tab) => !tab.isSystemSideEffect,
  );
  const navigationMenuItems = findOwned(
    flatEntityMaps.flatNavigationMenuItemMaps,
  ).filter(
    (navigationMenuItem) => !isPersonalNavigationMenuItem(navigationMenuItem),
  );
  const commandMenuItems = findOwned(
    flatEntityMaps.flatCommandMenuItemMaps,
  ).filter((commandMenuItem) => !commandMenuItem.isSystemSideEffect);
  const workflows = findOwned(flatEntityMaps.flatWorkflowMaps).filter(
    (workflow) => workflow.visibility === WorkflowVisibility.WORKSPACE,
  );
  const frontComponents = findOwned(flatEntityMaps.flatFrontComponentMaps);
  const roles = findOwned(flatEntityMaps.flatRoleMaps);
  const permissionFlags = findOwned(flatEntityMaps.flatPermissionFlagMaps);

  const pageLayoutWidgets = findOwned(
    flatEntityMaps.flatPageLayoutWidgetMaps,
  ).filter((widget) => !widget.isSystemSideEffect);

  const fieldCountByObject = countByKey({
    items: fields,
    getKey: (field) => field.objectMetadataUniversalIdentifier,
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
  const viewFieldCountByView = countByKey({
    items: viewFields,
    getKey: (viewField) => viewField.viewUniversalIdentifier,
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
        'frontComponentUniversalIdentifier' in widget.universalConfiguration
          ? widget.universalConfiguration.frontComponentUniversalIdentifier
          : undefined,
      ),
    ],
    getKey: (frontComponentUniversalIdentifier) =>
      frontComponentUniversalIdentifier,
  });
  const roleCountByPermissionFlag = countByKey({
    items: findOwned(flatEntityMaps.flatRolePermissionFlagMaps),
    getKey: (rolePermissionFlag) =>
      rolePermissionFlag.permissionFlagUniversalIdentifier,
  });

  const findPublishedWorkflowVersionStatus = (
    workflowVersionId: string | null,
  ) => {
    if (!isDefined(workflowVersionId)) {
      return 'DRAFT';
    }

    return (
      findByUniversalIdentifier({
        valueByUniversalIdentifier:
          flatEntityMaps.flatWorkflowVersionMaps.byUniversalIdentifier,
        universalIdentifier:
          flatEntityMaps.flatWorkflowVersionMaps.universalIdentifierById[
            workflowVersionId
          ],
      })?.status ?? null
    );
  };

  const findFieldLabel = (fieldUniversalIdentifier: string | null) =>
    findByUniversalIdentifier({
      valueByUniversalIdentifier:
        flatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
      universalIdentifier: fieldUniversalIdentifier,
    })?.label;

  return {
    objects: objects.map((object) => ({
      id: object.id,
      universalIdentifier: object.universalIdentifier,
      label: object.labelPlural,
      icon: object.icon,
      color: object.color,
      description: object.description,
      count: fieldCountByObject.get(object.universalIdentifier) ?? 0,
    })),
    fields: fields.map((field) => ({
      id: field.id,
      universalIdentifier: field.universalIdentifier,
      label: field.label,
      icon: field.icon,
      description: field.description,
      objectUniversalIdentifier: field.objectMetadataUniversalIdentifier,
      tag: field.type,
      count: viewCountByField.get(field.universalIdentifier) ?? 0,
    })),
    indexes: indexes.map((index) => ({
      id: index.id,
      universalIdentifier: index.universalIdentifier,
      label: index.universalFlatIndexFieldMetadatas
        .map(
          (indexField) =>
            findFieldLabel(indexField.fieldMetadataUniversalIdentifier) ??
            index.name,
        )
        .join(', '),
      objectUniversalIdentifier: index.objectMetadataUniversalIdentifier,
      tag: index.isUnique ? 'UNIQUE' : null,
      count: index.universalFlatIndexFieldMetadatas.length,
    })),
    views: views.map((view) => ({
      id: view.id,
      universalIdentifier: view.universalIdentifier,
      label: view.name,
      icon: view.icon,
      objectUniversalIdentifier: view.objectMetadataUniversalIdentifier,
      tag: view.type,
      count: viewFieldCountByView.get(view.universalIdentifier) ?? 0,
    })),
    viewFields: viewFields.map((viewField) => ({
      id: viewField.id,
      universalIdentifier: viewField.universalIdentifier,
      label:
        findFieldLabel(viewField.fieldMetadataUniversalIdentifier) ??
        viewField.fieldMetadataUniversalIdentifier,
      parentLabel: findByUniversalIdentifier({
        valueByUniversalIdentifier:
          flatEntityMaps.flatViewMaps.byUniversalIdentifier,
        universalIdentifier: viewField.viewUniversalIdentifier,
      })?.name,
      parentUniversalIdentifier: viewField.viewUniversalIdentifier,
      fieldUniversalIdentifier: viewField.fieldMetadataUniversalIdentifier,
      position: viewField.position,
    })),
    pageLayouts: pageLayouts.map((pageLayout) => ({
      id: pageLayout.id,
      universalIdentifier: pageLayout.universalIdentifier,
      label: pageLayout.name,
      objectUniversalIdentifier: pageLayout.objectMetadataUniversalIdentifier,
      tag: pageLayout.type,
      count: tabCountByPageLayout.get(pageLayout.universalIdentifier) ?? 0,
    })),
    pageLayoutTabs: pageLayoutTabs.map((tab) => ({
      id: tab.id,
      universalIdentifier: tab.universalIdentifier,
      label: tab.title,
      icon: tab.icon,
      parentLabel: findByUniversalIdentifier({
        valueByUniversalIdentifier:
          flatEntityMaps.flatPageLayoutMaps.byUniversalIdentifier,
        universalIdentifier: tab.pageLayoutUniversalIdentifier,
      })?.name,
      parentUniversalIdentifier: tab.pageLayoutUniversalIdentifier,
      count: widgetCountByTab.get(tab.universalIdentifier) ?? 0,
    })),
    navigationMenuItems: navigationMenuItems.map((navigationMenuItem) => ({
      id: navigationMenuItem.id,
      universalIdentifier: navigationMenuItem.universalIdentifier,
      label: getNavigationMenuItemContentLabel({
        name: navigationMenuItem.name,
        viewName: findByUniversalIdentifier({
          valueByUniversalIdentifier:
            flatEntityMaps.flatViewMaps.byUniversalIdentifier,
          universalIdentifier: navigationMenuItem.viewUniversalIdentifier,
        })?.name,
        objectLabel: findByUniversalIdentifier({
          valueByUniversalIdentifier:
            flatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
          universalIdentifier:
            navigationMenuItem.targetObjectMetadataUniversalIdentifier,
        })?.labelPlural,
        link: navigationMenuItem.link,
        type: navigationMenuItem.type,
      }),
      icon: navigationMenuItem.icon,
      color: navigationMenuItem.color,
      objectUniversalIdentifier:
        navigationMenuItem.targetObjectMetadataUniversalIdentifier ??
        findByUniversalIdentifier({
          valueByUniversalIdentifier:
            flatEntityMaps.flatViewMaps.byUniversalIdentifier,
          universalIdentifier: navigationMenuItem.viewUniversalIdentifier,
        })?.objectMetadataUniversalIdentifier,
      parentLabel: findByUniversalIdentifier({
        valueByUniversalIdentifier:
          flatEntityMaps.flatNavigationMenuItemMaps.byUniversalIdentifier,
        universalIdentifier: navigationMenuItem.folderUniversalIdentifier,
      })?.name,
      parentUniversalIdentifier: navigationMenuItem.folderUniversalIdentifier,
      tag: navigationMenuItem.type,
      position: navigationMenuItem.position,
    })),
    commandMenuItems: commandMenuItems.map((commandMenuItem) => ({
      id: commandMenuItem.id,
      universalIdentifier: commandMenuItem.universalIdentifier,
      label: commandMenuItem.label,
      icon: commandMenuItem.icon,
      objectUniversalIdentifier:
        commandMenuItem.navigationTargetObjectMetadataUniversalIdentifier ??
        commandMenuItem.availabilityObjectMetadataUniversalIdentifier,
      tag: commandMenuItem.availabilityType,
    })),
    frontComponents: frontComponents.map((frontComponent) => ({
      id: frontComponent.id,
      universalIdentifier: frontComponent.universalIdentifier,
      label: frontComponent.name,
      description: frontComponent.description,
      tag:
        frontComponent.widgetAvailability.length > 0
          ? 'WIDGET'
          : 'FRONT_COMPONENT',
      count:
        placementCountByFrontComponent.get(
          frontComponent.universalIdentifier,
        ) ?? 0,
    })),
    workflows: workflows.map((workflow) => ({
      id: workflow.id,
      universalIdentifier: workflow.universalIdentifier,
      label: workflow.name ?? workflow.universalIdentifier,
      tag: findPublishedWorkflowVersionStatus(
        workflow.lastPublishedCoreWorkflowVersionId,
      ),
    })),
    logicFunctions: findOwned(flatEntityMaps.flatLogicFunctionMaps).map(
      (logicFunction) => ({
        id: logicFunction.id,
        universalIdentifier: logicFunction.universalIdentifier,
        label: logicFunction.name,
        description: logicFunction.description,
        tag: getLogicFunctionTriggerTag(logicFunction),
        timeoutSeconds: logicFunction.timeoutSeconds,
      }),
    ),
    agents: findOwned(flatEntityMaps.flatAgentMaps).map((agent) => ({
      id: agent.id,
      universalIdentifier: agent.universalIdentifier,
      label: agent.label,
      icon: agent.icon,
      description: agent.description,
    })),
    skills: findOwned(flatEntityMaps.flatSkillMaps).map((skill) => ({
      id: skill.id,
      universalIdentifier: skill.universalIdentifier,
      label: skill.label,
      icon: skill.icon,
      description: skill.description,
    })),
    roles: roles.map((role) => ({
      id: role.id,
      universalIdentifier: role.universalIdentifier,
      label: role.label,
      icon: role.icon,
      description: role.description,
    })),
    permissionFlags: permissionFlags.map((permissionFlag) => ({
      id: permissionFlag.id,
      universalIdentifier: permissionFlag.universalIdentifier,
      label: permissionFlag.label,
      icon: permissionFlag.icon,
      description: permissionFlag.description,
      tag: permissionFlag.permissionType,
      count:
        roleCountByPermissionFlag.get(permissionFlag.universalIdentifier) ?? 0,
    })),
    connectionProviders: findOwned(
      flatEntityMaps.flatConnectionProviderMaps,
    ).map((connectionProvider) => ({
      id: connectionProvider.id,
      universalIdentifier: connectionProvider.universalIdentifier,
      label: connectionProvider.displayName,
      tag: connectionProvider.type,
    })),
    publicAssets: [],
    translations: [],
  };
};
