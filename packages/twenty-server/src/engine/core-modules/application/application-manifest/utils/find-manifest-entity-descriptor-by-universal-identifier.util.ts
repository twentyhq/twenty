import { type Manifest } from 'twenty-shared/application';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

export type ManifestEntityDescriptor = {
  entityKind: string;
  label?: string;
};

type ManifestEntityCandidate = {
  universalIdentifier: string;
  label?: string;
};

type ManifestEntityRegistryEntry = {
  entityKind: string;
  getCandidates: (manifest: Manifest) => ManifestEntityCandidate[];
};

const NO_MANIFEST_CANDIDATES: ManifestEntityCandidate[] = [];

const toCandidates = <T extends { universalIdentifier?: string }>(
  entities: T[] | undefined,
  getLabel: (entity: T) => string | undefined,
): ManifestEntityCandidate[] =>
  (entities ?? [])
    .filter((entity): entity is T & { universalIdentifier: string } =>
      isDefined(entity.universalIdentifier),
    )
    .map((entity) => ({
      universalIdentifier: entity.universalIdentifier,
      label: getLabel(entity),
    }));

const MANIFEST_ENTITY_REGISTRY: Record<
  AllMetadataName,
  ManifestEntityRegistryEntry
> = {
  objectMetadata: {
    entityKind: 'object',
    getCandidates: (manifest) =>
      toCandidates(manifest.objects, (object) => object.labelSingular),
  },
  fieldMetadata: {
    entityKind: 'field',
    getCandidates: (manifest) => [
      ...toCandidates(manifest.fields, (field) => field.label),
      ...(manifest.objects ?? []).flatMap((object) =>
        toCandidates(object.fields, (field) => field.label),
      ),
    ],
  },
  role: {
    entityKind: 'role',
    getCandidates: (manifest) =>
      toCandidates(manifest.roles, (role) => role.label),
  },
  permissionFlag: {
    entityKind: 'permission flag',
    getCandidates: (manifest) =>
      toCandidates(
        manifest.permissionFlags,
        (permissionFlag) => permissionFlag.label,
      ),
  },
  skill: {
    entityKind: 'skill',
    getCandidates: (manifest) =>
      toCandidates(manifest.skills, (skill) => skill.label),
  },
  agent: {
    entityKind: 'agent',
    getCandidates: (manifest) =>
      toCandidates(manifest.agents, (agent) => agent.label),
  },
  connectionProvider: {
    entityKind: 'connection provider',
    getCandidates: (manifest) =>
      toCandidates(
        manifest.connectionProviders,
        (connectionProvider) => connectionProvider.displayName,
      ),
  },
  view: {
    entityKind: 'view',
    getCandidates: (manifest) =>
      toCandidates(manifest.views, (view) => view.name),
  },
  pageLayout: {
    entityKind: 'page layout',
    getCandidates: (manifest) =>
      toCandidates(manifest.pageLayouts, (pageLayout) => pageLayout.name),
  },
  pageLayoutTab: {
    entityKind: 'page layout tab',
    getCandidates: (manifest) => [
      ...toCandidates(
        manifest.pageLayoutTabs,
        (pageLayoutTab) => pageLayoutTab.title,
      ),
      ...(manifest.pageLayouts ?? []).flatMap((pageLayout) =>
        toCandidates(pageLayout.tabs, (pageLayoutTab) => pageLayoutTab.title),
      ),
    ],
  },
  pageLayoutWidget: {
    entityKind: 'page layout widget',
    getCandidates: (manifest) => [
      ...(manifest.pageLayoutTabs ?? []).flatMap((pageLayoutTab) =>
        toCandidates(pageLayoutTab.widgets, (widget) => widget.title),
      ),
      ...(manifest.pageLayouts ?? []).flatMap((pageLayout) =>
        (pageLayout.tabs ?? []).flatMap((pageLayoutTab) =>
          toCandidates(pageLayoutTab.widgets, (widget) => widget.title),
        ),
      ),
    ],
  },
  commandMenuItem: {
    entityKind: 'command menu item',
    getCandidates: (manifest) =>
      toCandidates(
        manifest.commandMenuItems,
        (commandMenuItem) => commandMenuItem.label,
      ),
  },
  logicFunction: {
    entityKind: 'logic function',
    getCandidates: (manifest) =>
      toCandidates(
        manifest.logicFunctions,
        (logicFunction) => logicFunction.name,
      ),
  },
  frontComponent: {
    entityKind: 'front component',
    getCandidates: (manifest) =>
      toCandidates(
        manifest.frontComponents,
        (frontComponent) => frontComponent.name,
      ),
  },
  navigationMenuItem: {
    entityKind: 'navigation menu item',
    getCandidates: (manifest) =>
      toCandidates(
        manifest.navigationMenuItems,
        (navigationMenuItem) => navigationMenuItem.name,
      ),
  },
  index: {
    entityKind: 'index',
    getCandidates: (manifest) =>
      toCandidates(manifest.indexes, () => undefined),
  },
  viewField: {
    entityKind: 'view field',
    getCandidates: (manifest) => [
      ...toCandidates(manifest.viewFields, () => undefined),
      ...(manifest.views ?? []).flatMap((view) =>
        toCandidates(view.fields, () => undefined),
      ),
    ],
  },
  viewFieldGroup: {
    entityKind: 'view field group',
    getCandidates: (manifest) =>
      (manifest.views ?? []).flatMap((view) =>
        toCandidates(view.fieldGroups, (fieldGroup) => fieldGroup.name),
      ),
  },
  viewGroup: {
    entityKind: 'view group',
    getCandidates: (manifest) =>
      (manifest.views ?? []).flatMap((view) =>
        toCandidates(view.groups, () => undefined),
      ),
  },
  viewSort: {
    entityKind: 'view sort',
    getCandidates: (manifest) =>
      (manifest.views ?? []).flatMap((view) =>
        toCandidates(view.sorts, () => undefined),
      ),
  },
  viewFilter: {
    entityKind: 'view filter',
    getCandidates: (manifest) =>
      (manifest.views ?? []).flatMap((view) =>
        toCandidates(view.filters, () => undefined),
      ),
  },
  viewFilterGroup: {
    entityKind: 'view filter group',
    getCandidates: (manifest) =>
      (manifest.views ?? []).flatMap((view) =>
        toCandidates(view.filterGroups, () => undefined),
      ),
  },
  objectPermission: {
    entityKind: 'object permission',
    getCandidates: (manifest) =>
      (manifest.roles ?? []).flatMap((role) =>
        toCandidates(role.objectPermissions, () => undefined),
      ),
  },
  fieldPermission: {
    entityKind: 'field permission',
    getCandidates: (manifest) =>
      (manifest.roles ?? []).flatMap((role) =>
        toCandidates(role.fieldPermissions, () => undefined),
      ),
  },
  rowLevelPermissionPredicate: {
    entityKind: 'row-level permission predicate',
    getCandidates: (manifest) =>
      (manifest.roles ?? []).flatMap((role) =>
        toCandidates(role.rowLevelPermissionPredicates, () => undefined),
      ),
  },
  rowLevelPermissionPredicateGroup: {
    entityKind: 'row-level permission predicate group',
    getCandidates: (manifest) =>
      (manifest.roles ?? []).flatMap((role) =>
        toCandidates(role.rowLevelPermissionPredicateGroups, () => undefined),
      ),
  },
  roleTarget: {
    entityKind: 'role target',
    getCandidates: () => NO_MANIFEST_CANDIDATES,
  },
  rolePermissionFlag: {
    entityKind: 'role permission flag',
    getCandidates: () => NO_MANIFEST_CANDIDATES,
  },
  webhook: {
    entityKind: 'webhook',
    getCandidates: () => NO_MANIFEST_CANDIDATES,
  },
  applicationVariable: {
    entityKind: 'application variable',
    getCandidates: () => NO_MANIFEST_CANDIDATES,
  },
  searchFieldMetadata: {
    entityKind: 'search field',
    getCandidates: () => NO_MANIFEST_CANDIDATES,
  },
};

const MANIFEST_ENTITY_REGISTRY_ENTRIES = Object.values(
  MANIFEST_ENTITY_REGISTRY,
);

export const findManifestEntityDescriptorByUniversalIdentifier = ({
  manifest,
  universalIdentifier,
}: {
  manifest: Manifest;
  universalIdentifier: string;
}): ManifestEntityDescriptor | undefined => {
  for (const {
    entityKind,
    getCandidates,
  } of MANIFEST_ENTITY_REGISTRY_ENTRIES) {
    const match = getCandidates(manifest).find(
      (candidate) => candidate.universalIdentifier === universalIdentifier,
    );

    if (isDefined(match)) {
      return { entityKind, label: match.label };
    }
  }

  return undefined;
};
