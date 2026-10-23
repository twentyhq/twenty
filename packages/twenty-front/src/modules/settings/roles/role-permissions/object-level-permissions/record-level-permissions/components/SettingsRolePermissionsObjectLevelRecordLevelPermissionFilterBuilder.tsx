/* @license Enterprise */

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderContent } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderContent';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';

type SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderProps =
  {
    roleId: string;
    objectMetadataItem: EnrichedObjectMetadataItem;
    readonly?: boolean;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder =
  ({
    roleId,
    objectMetadataItem,
    readonly,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderProps) => {
    const instanceId = useWorkspaceSurfaceScopedComponentInstanceId(
      `record-level-permission-filter-${roleId}-${objectMetadataItem.id}`,
    );

    return (
      <RecordFilterGroupsComponentInstanceContext.Provider
        value={{ instanceId }}
      >
        <RecordFiltersComponentInstanceContext.Provider value={{ instanceId }}>
          <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderContent
            roleId={roleId}
            objectMetadataItem={objectMetadataItem}
            readonly={readonly}
          />
        </RecordFiltersComponentInstanceContext.Provider>
      </RecordFilterGroupsComponentInstanceContext.Provider>
    );
  };
