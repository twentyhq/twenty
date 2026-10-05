import {
  FIELD_ENUM_BINDINGS,
  INDEX_ENUM_BINDINGS,
  NAVIGATION_MENU_ITEM_ENUM_BINDINGS,
  PAGE_LAYOUT_WIDGET_ENUM_BINDINGS,
  OBJECT_ENUM_BINDINGS,
  PAGE_LAYOUT_ENUM_BINDINGS,
  PAGE_LAYOUT_TAB_ENUM_BINDINGS,
  ROLE_ENUM_BINDINGS,
  VIEW_ENUM_BINDINGS,
  VIEW_FIELD_ENUM_BINDINGS,
  type EnumBinding,
} from '@/app/pull/write-define-file';
import {
  buildIndexFileBaseName,
  buildViewFieldFileBaseName,
  type FieldLocation,
  toFileBaseName,
} from '@/app/pull/pull-file-base-name';
import { stripGraphqlTypename } from '@/app/pull/strip-graphql-typename';
import { kebabCase } from '@/app/pull/kebab-case';
import { type Manifest } from 'twenty-shared/application';
import { fromApplicationManifestToApplicationConfig } from '@/app/pull/from-application-manifest-to-application-config';
import { fromRoleManifestToRoleConfig } from '@/app/pull/from-role-manifest-to-role-config';
import { buildPullFieldFileName } from '@/app/pull/build-pull-field-file-name';
import { buildPullNavigationMenuItemFileName } from '@/app/pull/build-pull-navigation-menu-item-file-name';
import { getObjectNameForPullFile } from '@/app/pull/get-object-name-for-pull-file';
import { getPageLayoutNameForPullFile } from '@/app/pull/get-page-layout-name-for-pull-file';
import { getNavigationFolderNameForPullFile } from '@/app/pull/get-navigation-folder-name-for-pull-file';
import { isDefined } from 'twenty-shared/utils';

export const PULL_ENTITY_KINDS = [
  'application',
  'object',
  'field',
  'index',
  'permissionFlag',
  'role',
  'view',
  'viewField',
  'pageLayout',
  'pageLayoutTab',
  'navigationMenuItem',
  'pageLayoutWidget',
] as const;

export type PullEntityKind = (typeof PULL_ENTITY_KINDS)[number];

export type PullEntity = {
  kind: PullEntityKind;
  universalIdentifier: string;
  definer: string;
  config: unknown;
  enumBindings: EnumBinding[];
  defaultFolder: string;
  fileSuffix: string;
  fileBaseName: string;
  parentName: string | null;
};

export type SkippedPullEntity = {
  kind: PullEntityKind;
  universalIdentifier: string;
  reason: string;
};

export const buildPullEntities = (
  manifest: Manifest,
): { entities: PullEntity[]; skipped: SkippedPullEntity[] } => {
  const applicationUniversalIdentifier =
    manifest.application.universalIdentifier;
  const entities: PullEntity[] = [];
  const skipped: SkippedPullEntity[] = [];

  entities.push({
    kind: 'application',
    universalIdentifier: applicationUniversalIdentifier,
    definer: 'defineApplication',
    config: fromApplicationManifestToApplicationConfig(manifest),
    enumBindings: [],
    defaultFolder: 'src',
    fileSuffix: '.config.ts',
    fileBaseName: 'application',
    parentName: null,
  });

  const writtenObjectUniversalIdentifiers = new Set<string>();
  const fieldLocationByUniversalIdentifier = new Map<string, FieldLocation>();

  for (const objectManifest of manifest.objects ?? []) {
    for (const field of objectManifest.fields ?? []) {
      fieldLocationByUniversalIdentifier.set(field.universalIdentifier, {
        objectName: objectManifest.nameSingular,
        fieldName: field.name,
      });
    }

    writtenObjectUniversalIdentifiers.add(objectManifest.universalIdentifier);

    entities.push({
      kind: 'object',
      universalIdentifier: objectManifest.universalIdentifier,
      definer: 'defineObject',
      config: objectManifest,
      enumBindings: OBJECT_ENUM_BINDINGS,
      defaultFolder: 'src/objects',
      fileSuffix: '.object.ts',
      fileBaseName: kebabCase(objectManifest.nameSingular),
      parentName: null,
    });
  }

  for (const fieldManifest of manifest.fields ?? []) {
    const objectName = getObjectNameForPullFile({
      objectUniversalIdentifier: fieldManifest.objectUniversalIdentifier,
      manifest,
    });

    fieldLocationByUniversalIdentifier.set(fieldManifest.universalIdentifier, {
      objectName,
      fieldName: fieldManifest.name,
    });

    entities.push({
      kind: 'field',
      universalIdentifier: fieldManifest.universalIdentifier,
      definer: 'defineField',
      config: fieldManifest,
      enumBindings: FIELD_ENUM_BINDINGS,
      defaultFolder: 'src/fields',
      fileSuffix: '.field.ts',
      fileBaseName: buildPullFieldFileName({
        objectName,
        fieldName: fieldManifest.name,
        fieldUniversalIdentifier: fieldManifest.universalIdentifier,
      }),
      parentName: objectName,
    });
  }

  for (const indexManifest of manifest.indexes ?? []) {
    if (
      !writtenObjectUniversalIdentifiers.has(
        indexManifest.objectUniversalIdentifier,
      )
    ) {
      skipped.push({
        kind: 'index',
        universalIdentifier: indexManifest.universalIdentifier,
        reason: 'its object is not part of the written source',
      });
      continue;
    }

    const objectName = getObjectNameForPullFile({
      objectUniversalIdentifier: indexManifest.objectUniversalIdentifier,
      manifest,
    });

    entities.push({
      kind: 'index',
      universalIdentifier: indexManifest.universalIdentifier,
      definer: 'defineIndex',
      config: indexManifest,
      enumBindings: INDEX_ENUM_BINDINGS,
      defaultFolder: 'src/indexes',
      fileSuffix: '.index.ts',
      fileBaseName: buildIndexFileBaseName({
        indexManifest,
        objectName,
        fieldLocationByUniversalIdentifier,
      }),
      parentName: objectName,
    });
  }

  for (const permissionFlagManifest of manifest.permissionFlags ?? []) {
    entities.push({
      kind: 'permissionFlag',
      universalIdentifier: permissionFlagManifest.universalIdentifier,
      definer: 'definePermissionFlag',
      config: permissionFlagManifest,
      enumBindings: [],
      defaultFolder: 'src/permission-flags',
      fileSuffix: '.permission-flag.ts',
      fileBaseName: toFileBaseName({
        segments: [permissionFlagManifest.key],
        universalIdentifier: permissionFlagManifest.universalIdentifier,
      }),
      parentName: null,
    });
  }

  for (const roleManifest of manifest.roles ?? []) {
    entities.push({
      kind: 'role',
      universalIdentifier: roleManifest.universalIdentifier,
      definer:
        roleManifest.universalIdentifier ===
        manifest.application.defaultRoleUniversalIdentifier
          ? 'defineApplicationRole'
          : 'defineRole',
      config: fromRoleManifestToRoleConfig({
        roleManifest,
        applicationUniversalIdentifier,
      }),
      enumBindings: ROLE_ENUM_BINDINGS,
      defaultFolder: 'src/roles',
      fileSuffix: '.role.ts',
      fileBaseName: toFileBaseName({
        segments: [roleManifest.label],
        universalIdentifier: roleManifest.universalIdentifier,
      }),
      parentName: null,
    });
  }

  for (const viewManifest of manifest.views ?? []) {
    entities.push({
      kind: 'view',
      universalIdentifier: viewManifest.universalIdentifier,
      definer: 'defineView',
      config: viewManifest,
      enumBindings: VIEW_ENUM_BINDINGS,
      defaultFolder: 'src/views',
      fileSuffix: '.view.ts',
      fileBaseName: toFileBaseName({
        segments: [viewManifest.name],
        universalIdentifier: viewManifest.universalIdentifier,
      }),
      parentName: getObjectNameForPullFile({
        objectUniversalIdentifier: viewManifest.objectUniversalIdentifier,
        manifest,
      }),
    });
  }

  for (const viewFieldManifest of manifest.viewFields ?? []) {
    entities.push({
      kind: 'viewField',
      universalIdentifier: viewFieldManifest.universalIdentifier,
      definer: 'defineViewField',
      config: viewFieldManifest,
      enumBindings: VIEW_FIELD_ENUM_BINDINGS,
      defaultFolder: 'src/view-fields',
      fileSuffix: '.view-field.ts',
      fileBaseName: buildViewFieldFileBaseName({
        viewFieldManifest,
        fieldLocationByUniversalIdentifier,
      }),
      parentName: null,
    });
  }

  for (const pageLayoutManifest of manifest.pageLayouts ?? []) {
    entities.push({
      kind: 'pageLayout',
      universalIdentifier: pageLayoutManifest.universalIdentifier,
      definer: 'definePageLayout',
      config: stripGraphqlTypename(pageLayoutManifest),
      enumBindings: PAGE_LAYOUT_ENUM_BINDINGS,
      defaultFolder: 'src/page-layouts',
      fileSuffix: '.page-layout.ts',
      fileBaseName: toFileBaseName({
        segments: [pageLayoutManifest.name],
        universalIdentifier: pageLayoutManifest.universalIdentifier,
      }),
      parentName: isDefined(pageLayoutManifest.objectUniversalIdentifier)
        ? getObjectNameForPullFile({
            objectUniversalIdentifier:
              pageLayoutManifest.objectUniversalIdentifier,
            manifest,
          })
        : null,
    });
  }

  for (const pageLayoutTabManifest of manifest.pageLayoutTabs ?? []) {
    const { pageLayoutUniversalIdentifier } = pageLayoutTabManifest;

    if (!isDefined(pageLayoutUniversalIdentifier)) {
      skipped.push({
        kind: 'pageLayoutTab',
        universalIdentifier: pageLayoutTabManifest.universalIdentifier,
        reason: 'it does not name the page layout it belongs to',
      });
      continue;
    }

    entities.push({
      kind: 'pageLayoutTab',
      universalIdentifier: pageLayoutTabManifest.universalIdentifier,
      definer: 'definePageLayoutTab',
      config: stripGraphqlTypename(pageLayoutTabManifest),
      enumBindings: PAGE_LAYOUT_TAB_ENUM_BINDINGS,
      defaultFolder: 'src/page-layout-tabs',
      fileSuffix: '.page-layout-tab.ts',
      fileBaseName: toFileBaseName({
        segments: [pageLayoutTabManifest.title],
        universalIdentifier: pageLayoutTabManifest.universalIdentifier,
      }),
      parentName: getPageLayoutNameForPullFile({
        pageLayoutUniversalIdentifier,
        manifest,
      }),
    });
  }

  for (const navigationMenuItemManifest of manifest.navigationMenuItems ?? []) {
    const { folderUniversalIdentifier } = navigationMenuItemManifest;

    entities.push({
      kind: 'navigationMenuItem',
      universalIdentifier: navigationMenuItemManifest.universalIdentifier,
      definer: 'defineNavigationMenuItem',
      config: navigationMenuItemManifest,
      enumBindings: NAVIGATION_MENU_ITEM_ENUM_BINDINGS,
      defaultFolder: 'src/navigation-menu-items',
      fileSuffix: '.navigation-menu-item.ts',
      fileBaseName: buildPullNavigationMenuItemFileName({
        navigationMenuItemManifest,
        manifest,
      }),
      parentName: isDefined(folderUniversalIdentifier)
        ? getNavigationFolderNameForPullFile({
            folderUniversalIdentifier,
            manifest,
          })
        : null,
    });
  }

  for (const pageLayoutWidgetManifest of manifest.pageLayoutWidgets ?? []) {
    const { objectUniversalIdentifier } = pageLayoutWidgetManifest;

    entities.push({
      kind: 'pageLayoutWidget',
      universalIdentifier: pageLayoutWidgetManifest.universalIdentifier,
      definer: 'definePageLayoutWidget',
      config: stripGraphqlTypename(pageLayoutWidgetManifest),
      enumBindings: PAGE_LAYOUT_WIDGET_ENUM_BINDINGS,
      defaultFolder: 'src/page-layout-widgets',
      fileSuffix: '.page-layout-widget.ts',
      fileBaseName: toFileBaseName({
        segments: [pageLayoutWidgetManifest.title],
        universalIdentifier: pageLayoutWidgetManifest.universalIdentifier,
      }),
      parentName: isDefined(objectUniversalIdentifier)
        ? getObjectNameForPullFile({ objectUniversalIdentifier, manifest })
        : null,
    });
  }

  return { entities, skipped };
};
