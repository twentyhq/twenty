import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRolePermissions } from '@/settings/roles/role-permissions/components/SettingsRolePermissions';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  type ObjectFieldManifest,
  type ObjectManifest,
  type RoleManifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { findObjectNameByUniversalIdentifier } from '~/pages/settings/applications/utils/findObjectNameByUniversalIdentifier';

type SettingsApplicationPermissionsTabProps = {
  defaultRoleId?: string | null;
  marketplaceAppDefaultRole?: RoleManifest;
  marketplaceAppObjects?: ObjectManifest[];
};

const resolvePermissionIds = (
  defaultRole: RoleManifest,
  objectMetadataItems: EnrichedObjectMetadataItem[],
): {
  objectUniversalIdToIdMap: Record<string, string>;
  fieldUniversalIdToIdMap: Record<string, string>;
} => {
  const objectUniversalIdToIdMap: Record<string, string> = {};
  const fieldUniversalIdToIdMap: Record<string, string> = {};

  const allObjectUniversalIds = new Set<string>();

  for (const permission of defaultRole.objectPermissions ?? []) {
    allObjectUniversalIds.add(permission.objectUniversalIdentifier);
  }
  for (const permission of defaultRole.fieldPermissions ?? []) {
    allObjectUniversalIds.add(permission.objectUniversalIdentifier);
  }

  for (const universalId of allObjectUniversalIds) {
    const standardObjectName = findObjectNameByUniversalIdentifier(universalId);

    if (isDefined(standardObjectName)) {
      const workspaceObject = objectMetadataItems.find(
        (item) => item.nameSingular === standardObjectName,
      );

      if (isDefined(workspaceObject)) {
        objectUniversalIdToIdMap[universalId] = workspaceObject.id;
      }
    }
  }

  for (const permission of defaultRole.fieldPermissions ?? []) {
    const objectName = findObjectNameByUniversalIdentifier(
      permission.objectUniversalIdentifier,
    );

    if (isDefined(objectName)) {
      const standardObject =
        STANDARD_OBJECTS[objectName as keyof typeof STANDARD_OBJECTS];

      if (isDefined(standardObject)) {
        for (const [fieldName, fieldDef] of Object.entries(
          standardObject.fields,
        )) {
          if (
            (fieldDef as { universalIdentifier: string })
              .universalIdentifier === permission.fieldUniversalIdentifier
          ) {
            const workspaceObject = objectMetadataItems.find(
              (item) => item.nameSingular === objectName,
            );
            const workspaceField = workspaceObject?.fields.find(
              (field) => field.name === fieldName,
            );

            if (isDefined(workspaceField)) {
              fieldUniversalIdToIdMap[permission.fieldUniversalIdentifier] =
                workspaceField.id;
            }
            break;
          }
        }
      }
    }
  }

  return { objectUniversalIdToIdMap, fieldUniversalIdToIdMap };
};

const buildSyntheticRole = (
  defaultRole: RoleManifest,
  objectUniversalIdToIdMap: Record<string, string>,
  fieldUniversalIdToIdMap: Record<string, string>,
): RoleWithPartialMembers => ({
  __typename: 'Role',
  id: defaultRole.universalIdentifier,
  label: defaultRole.label,
  description: defaultRole.description ?? '',
  icon: '',
  isEditable: false,
  canReadAllObjectRecords: defaultRole.canReadAllObjectRecords ?? false,
  canUpdateAllObjectRecords: defaultRole.canUpdateAllObjectRecords ?? false,
  canSoftDeleteAllObjectRecords:
    defaultRole.canSoftDeleteAllObjectRecords ?? false,
  canDestroyAllObjectRecords: defaultRole.canDestroyAllObjectRecords ?? false,
  canUpdateAllSettings: defaultRole.canUpdateAllSettings ?? false,
  canAccessAllTools: defaultRole.canAccessAllTools ?? false,
  canBeAssignedToUsers: false,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
  workspaceMembers: [],
  agents: [],
  apiKeys: [],
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
  objectPermissions: (defaultRole.objectPermissions ?? []).map(
    (permission) => ({
      __typename: 'ObjectPermission' as const,
      objectMetadataId:
        objectUniversalIdToIdMap[permission.objectUniversalIdentifier] ??
        permission.objectUniversalIdentifier,
      canReadObjectRecords: permission.canReadObjectRecords,
      canUpdateObjectRecords: permission.canUpdateObjectRecords,
      canSoftDeleteObjectRecords: permission.canSoftDeleteObjectRecords,
      canDestroyObjectRecords: permission.canDestroyObjectRecords,
    }),
  ),
  fieldPermissions: (defaultRole.fieldPermissions ?? []).map((permission) => ({
    __typename: 'FieldPermission' as const,
    id: uuidv4(),
    roleId: defaultRole.universalIdentifier,
    objectMetadataId:
      objectUniversalIdToIdMap[permission.objectUniversalIdentifier] ??
      permission.objectUniversalIdentifier,
    fieldMetadataId:
      fieldUniversalIdToIdMap[permission.fieldUniversalIdentifier] ??
      permission.fieldUniversalIdentifier,
    canReadFieldValue: permission.canReadFieldValue,
    canUpdateFieldValue: permission.canUpdateFieldValue,
  })),
  permissionFlags: (defaultRole.permissionFlags ?? []).map(
    (permissionFlag) => ({
      __typename: 'PermissionFlag' as const,
      id: uuidv4(),
      roleId: defaultRole.universalIdentifier,
      flag: permissionFlag.flag,
    }),
  ),
});

const buildFieldMetadataItemFromMarketplaceField = (
  field: ObjectFieldManifest,
): FieldMetadataItem => {
  const now = new Date().toISOString();

  return {
    id: field.universalIdentifier ?? uuidv4(),
    universalIdentifier: field.universalIdentifier ?? uuidv4(),
    name: field.name,
    label: field.label,
    type: (field.type as FieldMetadataType) ?? FieldMetadataType.TEXT,
    description: field.description ?? '',
    icon: field.icon ?? 'IconField',
    isActive: true,
    isCustom: true,
    isSystem: false,
    isNullable: true,
    isUnique: false,
    isUIReadOnly: false,
    createdAt: now,
    updatedAt: now,
    defaultValue: null,
    options: null,
    relation: null,
    settings: null,
  };
};

const buildobjectMetadataItemsFromMarketplaceApp = (
  defaultRole: RoleManifest,
  objectUniversalIdToIdMap: Record<string, string>,
  marketplaceAppObjects: ObjectManifest[],
): EnrichedObjectMetadataItem[] => {
  const unresolvedUniversalIds = new Set<string>();

  for (const permission of defaultRole.objectPermissions ?? []) {
    if (
      !isDefined(objectUniversalIdToIdMap[permission.objectUniversalIdentifier])
    ) {
      unresolvedUniversalIds.add(permission.objectUniversalIdentifier);
    }
  }
  for (const permission of defaultRole.fieldPermissions ?? []) {
    if (
      !isDefined(objectUniversalIdToIdMap[permission.objectUniversalIdentifier])
    ) {
      unresolvedUniversalIds.add(permission.objectUniversalIdentifier);
    }
  }

  const appObjectsByUniversalId = new Map(
    marketplaceAppObjects.map((obj) => [obj.universalIdentifier, obj]),
  );

  return [...unresolvedUniversalIds]
    .map((universalId) => {
      const appObject = appObjectsByUniversalId.get(universalId);

      if (!isDefined(appObject)) {
        return undefined;
      }

      const fields = appObject.fields.map(
        buildFieldMetadataItemFromMarketplaceField,
      );

      const objectFieldPermissions = (
        defaultRole.fieldPermissions ?? []
      ).filter(
        (permission) => permission.objectUniversalIdentifier === universalId,
      );

      const nonReadableFieldIds = new Set(
        objectFieldPermissions
          .filter((permission) => permission.canReadFieldValue === false)
          .map((permission) => permission.fieldUniversalIdentifier),
      );

      const nonUpdatableFieldIds = new Set(
        objectFieldPermissions
          .filter((permission) => permission.canUpdateFieldValue === false)
          .map((permission) => permission.fieldUniversalIdentifier),
      );

      const item: EnrichedObjectMetadataItem = {
        __typename: 'Object',
        id: universalId,
        universalIdentifier: universalId,
        nameSingular: appObject.nameSingular,
        namePlural: appObject.namePlural,
        labelSingular: appObject.labelSingular,
        labelPlural: appObject.labelPlural,
        description: appObject.description ?? '',
        icon: appObject.icon ?? 'IconBox',
        isCustom: true,
        isRemote: false,
        isActive: true,
        isSystem: false,
        isSearchable: false,
        isUIReadOnly: false,
        isLabelSyncedWithName: false,
        labelIdentifierFieldMetadataId: '',
        fields,
        readableFields: fields.filter(
          (field) => !nonReadableFieldIds.has(field.id),
        ),
        updatableFields: fields.filter(
          (field) => !nonUpdatableFieldIds.has(field.id),
        ),
        indexMetadatas: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return item;
    })
    .filter(isDefined);
};

const MarketplaceRoleEffect = ({
  defaultRole,
  marketplaceAppObjects,
  onObjectMetadataItemsFromMarketplaceApp,
}: {
  defaultRole: RoleManifest;
  marketplaceAppObjects: ObjectManifest[];
  onObjectMetadataItemsFromMarketplaceApp: (
    items: EnrichedObjectMetadataItem[],
  ) => void;
}) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    defaultRole.universalIdentifier,
  );

  const { resolvedRole, objectMetadataItemsFromMarketplaceApp } =
    useMemo(() => {
      const { objectUniversalIdToIdMap, fieldUniversalIdToIdMap } =
        resolvePermissionIds(defaultRole, objectMetadataItems);

      return {
        resolvedRole: buildSyntheticRole(
          defaultRole,
          objectUniversalIdToIdMap,
          fieldUniversalIdToIdMap,
        ),
        objectMetadataItemsFromMarketplaceApp:
          buildobjectMetadataItemsFromMarketplaceApp(
            defaultRole,
            objectUniversalIdToIdMap,
            marketplaceAppObjects,
          ),
      };
    }, [defaultRole, objectMetadataItems, marketplaceAppObjects]);

  useEffect(() => {
    setSettingsDraftRole(resolvedRole);
  }, [resolvedRole, setSettingsDraftRole]);

  useEffect(() => {
    onObjectMetadataItemsFromMarketplaceApp(
      objectMetadataItemsFromMarketplaceApp,
    );
  }, [
    objectMetadataItemsFromMarketplaceApp,
    onObjectMetadataItemsFromMarketplaceApp,
  ]);

  return null;
};

const MarketplaceAppPermissions = ({
  defaultRole,
  marketplaceAppObjects,
}: {
  defaultRole: RoleManifest;
  marketplaceAppObjects: ObjectManifest[];
}) => {
  const [
    objectMetadataItemsFromMarketplaceApp,
    setObjectMetadataItemsFromMarketplaceApp,
  ] = useState<EnrichedObjectMetadataItem[]>([]);

  const handleObjectsFromMarketplaceApp = useCallback(
    (objects: EnrichedObjectMetadataItem[]) =>
      setObjectMetadataItemsFromMarketplaceApp(objects),
    [],
  );

  return (
    <>
      <MarketplaceRoleEffect
        defaultRole={defaultRole}
        marketplaceAppObjects={marketplaceAppObjects}
        onObjectMetadataItemsFromMarketplaceApp={
          handleObjectsFromMarketplaceApp
        }
      />
      <SettingsRolePermissions
        roleId={defaultRole.universalIdentifier}
        isEditable={false}
        objectMetadataItemsFromMarketplaceApp={
          objectMetadataItemsFromMarketplaceApp
        }
      />
    </>
  );
};

export const SettingsApplicationPermissionsTab = ({
  defaultRoleId,
  marketplaceAppDefaultRole,
  marketplaceAppObjects,
}: SettingsApplicationPermissionsTabProps) => {
  if (isDefined(marketplaceAppDefaultRole)) {
    return (
      <MarketplaceAppPermissions
        defaultRole={marketplaceAppDefaultRole}
        marketplaceAppObjects={marketplaceAppObjects ?? []}
      />
    );
  }

  if (isDefined(defaultRoleId)) {
    return (
      <>
        <SettingsRolesQueryEffect />
        <SettingsRolePermissions roleId={defaultRoleId} isEditable={false} />
      </>
    );
  }

  return (
    <SettingsEmptyPlaceholder padding="0">
      {t`No permissions configured for this application.`}
    </SettingsEmptyPlaceholder>
  );
};
