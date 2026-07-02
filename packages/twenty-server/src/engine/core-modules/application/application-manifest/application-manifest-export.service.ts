import { Injectable } from '@nestjs/common';

import {
  type ApplicationManifest,
  type FieldManifest,
  type Manifest,
  type NavigationMenuItemManifest,
  type ObjectFieldManifest,
  type ObjectManifest,
  type PageLayoutManifest,
  type PermissionFlagManifest,
  type RoleManifest,
  type ViewManifest,
} from 'twenty-shared/application';
import {
  ALL_METADATA_NAME,
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { fromFlatFieldMetadataToObjectFieldManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-field-metadata-to-object-field-manifest.util';
import { fromFlatNavigationMenuItemToNavigationMenuItemManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-navigation-menu-item-to-navigation-menu-item-manifest.util';
import { fromFlatObjectMetadataToObjectManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-object-metadata-to-object-manifest.util';
import { fromFlatPageLayoutTabToPageLayoutTabManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-page-layout-tab-to-page-layout-tab-manifest.util';
import { fromFlatPageLayoutToPageLayoutManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-page-layout-to-page-layout-manifest.util';
import { fromFlatPageLayoutWidgetToPageLayoutWidgetManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-page-layout-widget-to-page-layout-widget-manifest.util';
import { fromFlatPermissionFlagToPermissionFlagManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-permission-flag-to-permission-flag-manifest.util';
import { fromFlatRoleToRoleManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-role-to-role-manifest.util';
import { fromFlatViewFieldToViewFieldManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-field-to-view-field-manifest.util';
import { fromFlatViewToViewManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-to-view-manifest.util';
import { getApplicationSubAllFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/get-application-sub-all-flat-entity-maps.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const byPositionThenUniversalIdentifier = (
  a: { position: number; universalIdentifier: string },
  b: { position: number; universalIdentifier: string },
): number =>
  a.position - b.position ||
  a.universalIdentifier.localeCompare(b.universalIdentifier);

const byNameThenUniversalIdentifier = (
  a: { name: string; universalIdentifier: string },
  b: { name: string; universalIdentifier: string },
): number =>
  a.name.localeCompare(b.name) ||
  a.universalIdentifier.localeCompare(b.universalIdentifier);

const DEFAULT_RELATION_FIELD_NAME_BY_TARGET_OBJECT: Record<
  (typeof DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS)[number],
  string
> = {
  timelineActivity: 'timelineActivities',
  attachment: 'attachments',
  noteTarget: 'noteTargets',
  taskTarget: 'taskTargets',
};

const DEFAULT_RELATION_TARGET_BY_FIELD_NAME: Record<string, string> =
  Object.fromEntries(
    DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.map((objectNameSingular) => [
      DEFAULT_RELATION_FIELD_NAME_BY_TARGET_OBJECT[objectNameSingular],
      STANDARD_OBJECTS[objectNameSingular].universalIdentifier,
    ]),
  );

const getDefinedValues = <T>(
  byUniversalIdentifier: Record<string, T | undefined>,
): T[] => Object.values(byUniversalIdentifier).filter(isDefined);

const groupByKey = <T>(
  items: T[],
  getKey: (item: T) => string | null | undefined,
): Map<string, T[]> => {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = getKey(item);

    if (!isDefined(key)) {
      continue;
    }

    const group = groups.get(key);

    if (isDefined(group)) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  return groups;
};

@Injectable()
export class ApplicationManifestExportService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  public async exportApplicationManifest({
    workspaceId,
    universalIdentifier,
  }: {
    workspaceId: string;
    universalIdentifier: string;
  }): Promise<{ applicationUniversalIdentifier: string; manifest: Manifest }> {
    const application = await this.applicationService.findByUniversalIdentifier({
      universalIdentifier,
      workspaceId,
    });

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application "${universalIdentifier}" is not installed in workspace "${workspaceId}".`,
        ApplicationExceptionCode.APP_NOT_INSTALLED,
      );
    }

    const flatEntityMapsCacheKeys = Object.values(ALL_METADATA_NAME).map(
      getMetadataFlatEntityMapsKey,
    );

    const fromAllFlatEntityMaps = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      flatEntityMapsCacheKeys,
    );

    const appMaps = getApplicationSubAllFlatEntityMaps({
      applicationIds: [application.id],
      fromAllFlatEntityMaps,
    });

    const { objects, fields } = this.reconstructObjectsAndFields(appMaps);
    const views = this.reconstructViews(appMaps);
    const navigationMenuItems = this.reconstructNavigationMenuItems(appMaps);
    const pageLayouts = this.reconstructPageLayouts(appMaps);
    const permissionFlags = this.reconstructPermissionFlags(appMaps);
    const roles = this.reconstructRoles(appMaps);

    const candidateDefaultRoleId =
      application.defaultRoleId ??
      (await this.applicationService.getWorkspaceDefaultRoleId(workspaceId));

    const defaultRoleUniversalIdentifier =
      this.resolveDefaultRoleUniversalIdentifier(
        appMaps,
        candidateDefaultRoleId,
        universalIdentifier,
      );

    const applicationManifest: ApplicationManifest = {
      universalIdentifier: application.universalIdentifier,
      displayName: application.name,
      description: application.description ?? '',
      defaultRoleUniversalIdentifier,
      packageJsonChecksum: application.packageJsonChecksum,
      yarnLockChecksum: application.yarnLockChecksum,
      ...(isDefined(application.logo) ? { logoUrl: application.logo } : {}),
    };

    const manifest: Manifest = {
      application: applicationManifest,
      objects,
      fields,
      logicFunctions: [],
      frontComponents: [],
      permissionFlags,
      roles,
      skills: [],
      agents: [],
      publicAssets: [],
      views,
      viewFields: [],
      navigationMenuItems,
      pageLayouts,
      pageLayoutTabs: [],
      commandMenuItems: [],
    };

    return {
      applicationUniversalIdentifier: application.universalIdentifier,
      manifest,
    };
  }

  private reconstructObjectsAndFields(appMaps: AllFlatEntityMaps): {
    objects: ObjectManifest[];
    fields: FieldManifest[];
  } {
    const allAppFlatObjectMetadatas = getDefinedValues(
      appMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    );

    const flatObjectMetadatas = allAppFlatObjectMetadatas
      .filter((flatObjectMetadata) => !flatObjectMetadata.isSystem)
      .sort((a, b) => a.nameSingular.localeCompare(b.nameSingular));

    const flatFieldMetadatas = getDefinedValues(
      appMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    ).sort(byNameThenUniversalIdentifier);

    const appObjectUniversalIdentifiers = new Set(
      allAppFlatObjectMetadatas.map(
        (flatObjectMetadata) => flatObjectMetadata.universalIdentifier,
      ),
    );

    const autoInjectedFieldUniversalIdentifiers =
      this.getAutoInjectedRelationFieldUniversalIdentifiers(flatFieldMetadatas);

    const flatFieldMetadatasByObjectUniversalIdentifier = groupByKey(
      flatFieldMetadatas,
      (flatFieldMetadata) => flatFieldMetadata.objectMetadataUniversalIdentifier,
    );

    const objects = flatObjectMetadatas.map((flatObjectMetadata) => {
      const objectFields: ObjectFieldManifest[] = (
        flatFieldMetadatasByObjectUniversalIdentifier.get(
          flatObjectMetadata.universalIdentifier,
        ) ?? []
      )
        .filter(
          (flatFieldMetadata) =>
            !autoInjectedFieldUniversalIdentifiers.has(
              flatFieldMetadata.universalIdentifier,
            ) &&
            (!flatFieldMetadata.isSystemSideEffect ||
              flatFieldMetadata.universalIdentifier ===
                flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier),
        )
        .map((flatFieldMetadata) =>
          fromFlatFieldMetadataToObjectFieldManifest({ flatFieldMetadata }),
        );

      return fromFlatObjectMetadataToObjectManifest({
        flatObjectMetadata,
        fields: objectFields,
      });
    });

    const fields: FieldManifest[] = flatFieldMetadatas
      .filter(
        (flatFieldMetadata) =>
          isDefined(
            flatFieldMetadata.objectMetadataUniversalIdentifier,
          ) &&
          !appObjectUniversalIdentifiers.has(
            flatFieldMetadata.objectMetadataUniversalIdentifier,
          ) &&
          !autoInjectedFieldUniversalIdentifiers.has(
            flatFieldMetadata.universalIdentifier,
          ) &&
          !flatFieldMetadata.isSystemSideEffect,
      )
      .map(
        (flatFieldMetadata) =>
          ({
            ...fromFlatFieldMetadataToObjectFieldManifest({
              flatFieldMetadata,
            }),
            objectUniversalIdentifier:
              flatFieldMetadata.objectMetadataUniversalIdentifier,
          }) as FieldManifest,
      );

    return { objects, fields };
  }

  private getAutoInjectedRelationFieldUniversalIdentifiers(
    flatFieldMetadatas: FlatFieldMetadata[],
  ): Set<string> {
    const autoInjectedUniversalIdentifiers = new Set<string>();

    for (const flatFieldMetadata of flatFieldMetadatas) {
      const defaultRelationTargetObjectUniversalIdentifier =
        DEFAULT_RELATION_TARGET_BY_FIELD_NAME[flatFieldMetadata.name];

      if (
        isMorphOrRelationFieldMetadataType(flatFieldMetadata.type) &&
        isDefined(defaultRelationTargetObjectUniversalIdentifier) &&
        flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier ===
          defaultRelationTargetObjectUniversalIdentifier
      ) {
        autoInjectedUniversalIdentifiers.add(
          flatFieldMetadata.universalIdentifier,
        );

        if (
          isDefined(
            flatFieldMetadata.relationTargetFieldMetadataUniversalIdentifier,
          )
        ) {
          autoInjectedUniversalIdentifiers.add(
            flatFieldMetadata.relationTargetFieldMetadataUniversalIdentifier,
          );
        }
      }
    }

    return autoInjectedUniversalIdentifiers;
  }

  private reconstructViews(appMaps: AllFlatEntityMaps): ViewManifest[] {
    const flatViews = getDefinedValues(
      appMaps.flatViewMaps.byUniversalIdentifier,
    )
      .filter((flatView) => !flatView.isSystemSideEffect)
      .sort(byNameThenUniversalIdentifier);

    const flatViewFieldsByViewUniversalIdentifier = groupByKey(
      getDefinedValues(appMaps.flatViewFieldMaps.byUniversalIdentifier).filter(
        (flatViewField) => !flatViewField.isSystemSideEffect,
      ),
      (flatViewField) => flatViewField.viewUniversalIdentifier,
    );

    return flatViews.map((flatView) => {
      const fields = (
        flatViewFieldsByViewUniversalIdentifier.get(
          flatView.universalIdentifier,
        ) ?? []
      )
        .sort(byPositionThenUniversalIdentifier)
        .map((flatViewField) =>
          fromFlatViewFieldToViewFieldManifest({ flatViewField }),
        );

      return fromFlatViewToViewManifest({ flatView, fields });
    });
  }

  private reconstructNavigationMenuItems(
    appMaps: AllFlatEntityMaps,
  ): NavigationMenuItemManifest[] {
    return getDefinedValues(
      appMaps.flatNavigationMenuItemMaps.byUniversalIdentifier,
    )
      .sort(byPositionThenUniversalIdentifier)
      .map((flatNavigationMenuItem) =>
        fromFlatNavigationMenuItemToNavigationMenuItemManifest({
          flatNavigationMenuItem,
        }),
      );
  }

  private reconstructPageLayouts(
    appMaps: AllFlatEntityMaps,
  ): PageLayoutManifest[] {
    const flatPageLayouts = getDefinedValues(
      appMaps.flatPageLayoutMaps.byUniversalIdentifier,
    )
      .filter((flatPageLayout) => !flatPageLayout.isSystemSideEffect)
      .sort(byNameThenUniversalIdentifier);

    const flatPageLayoutTabsByPageLayoutUniversalIdentifier = groupByKey(
      getDefinedValues(
        appMaps.flatPageLayoutTabMaps.byUniversalIdentifier,
      ).filter((flatPageLayoutTab) => !flatPageLayoutTab.isSystemSideEffect),
      (flatPageLayoutTab) => flatPageLayoutTab.pageLayoutUniversalIdentifier,
    );

    const flatPageLayoutWidgetsByTabUniversalIdentifier = groupByKey(
      getDefinedValues(
        appMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier,
      ).filter(
        (flatPageLayoutWidget) =>
          !flatPageLayoutWidget.isSystemSideEffect &&
          !this.referencesUnexportedFrontComponent(flatPageLayoutWidget),
      ),
      (flatPageLayoutWidget) =>
        flatPageLayoutWidget.pageLayoutTabUniversalIdentifier,
    );

    return flatPageLayouts.map((flatPageLayout) => {
      const tabs = (
        flatPageLayoutTabsByPageLayoutUniversalIdentifier.get(
          flatPageLayout.universalIdentifier,
        ) ?? []
      )
        .sort(byPositionThenUniversalIdentifier)
        .map((flatPageLayoutTab) => {
          const widgets = (
            flatPageLayoutWidgetsByTabUniversalIdentifier.get(
              flatPageLayoutTab.universalIdentifier,
            ) ?? []
          )
            .sort((a, b) =>
              a.universalIdentifier.localeCompare(b.universalIdentifier),
            )
            .map((flatPageLayoutWidget) =>
              fromFlatPageLayoutWidgetToPageLayoutWidgetManifest({
                flatPageLayoutWidget,
              }),
            );

          return fromFlatPageLayoutTabToPageLayoutTabManifest({
            flatPageLayoutTab,
            widgets,
          });
        });

      return fromFlatPageLayoutToPageLayoutManifest({ flatPageLayout, tabs });
    });
  }

  private referencesUnexportedFrontComponent(flatPageLayoutWidget: {
    universalConfiguration: unknown;
  }): boolean {
    const universalConfiguration =
      flatPageLayoutWidget.universalConfiguration as {
        frontComponentUniversalIdentifier?: string;
      } | null;

    return isDefined(universalConfiguration?.frontComponentUniversalIdentifier);
  }

  private reconstructPermissionFlags(
    appMaps: AllFlatEntityMaps,
  ): PermissionFlagManifest[] {
    return getDefinedValues(appMaps.flatPermissionFlagMaps.byUniversalIdentifier)
      .sort(
        (a, b) =>
          a.key.localeCompare(b.key) ||
          a.universalIdentifier.localeCompare(b.universalIdentifier),
      )
      .map((flatPermissionFlag) =>
        fromFlatPermissionFlagToPermissionFlagManifest({ flatPermissionFlag }),
      );
  }

  private reconstructRoles(appMaps: AllFlatEntityMaps): RoleManifest[] {
    const flatRoles = getDefinedValues(appMaps.flatRoleMaps.byUniversalIdentifier)
      .sort(
        (a, b) =>
          a.label.localeCompare(b.label) ||
          a.universalIdentifier.localeCompare(b.universalIdentifier),
      );

    const flatRolePermissionFlagsByRoleUniversalIdentifier = groupByKey(
      getDefinedValues(appMaps.flatRolePermissionFlagMaps.byUniversalIdentifier),
      (flatRolePermissionFlag) =>
        flatRolePermissionFlag.roleUniversalIdentifier,
    );

    return flatRoles.map((flatRole) => {
      const permissionFlagUniversalIdentifiers = (
        flatRolePermissionFlagsByRoleUniversalIdentifier.get(
          flatRole.universalIdentifier,
        ) ?? []
      )
        .map(
          (flatRolePermissionFlag) =>
            flatRolePermissionFlag.permissionFlagUniversalIdentifier,
        )
        .filter(isDefined)
        .sort((a, b) => a.localeCompare(b));

      return fromFlatRoleToRoleManifest({
        flatRole,
        permissionFlagUniversalIdentifiers,
      });
    });
  }

  private resolveDefaultRoleUniversalIdentifier(
    appMaps: AllFlatEntityMaps,
    candidateDefaultRoleId: string | null,
    universalIdentifier: string,
  ): string {
    const flatRoles = getDefinedValues(
      appMaps.flatRoleMaps.byUniversalIdentifier,
    );

    const matchedFlatRole = isDefined(candidateDefaultRoleId)
      ? flatRoles.find((flatRole) => flatRole.id === candidateDefaultRoleId)
      : undefined;

    if (isDefined(matchedFlatRole)) {
      return matchedFlatRole.universalIdentifier;
    }

    const fallbackFlatRole = [...flatRoles].sort((a, b) =>
      a.universalIdentifier.localeCompare(b.universalIdentifier),
    )[0];

    if (isDefined(fallbackFlatRole)) {
      return fallbackFlatRole.universalIdentifier;
    }

    throw new ApplicationException(
      `Application "${universalIdentifier}" has no role available to use as its default role.`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }
}
