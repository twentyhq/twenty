/* @license Enterprise */

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderContent } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderContent';

type SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderProps =
  {
    roleId: string;
    objectMetadataItem: ObjectMetadataItem;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder =
  ({
    roleId,
    objectMetadataItem,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderProps) => {
    const instanceId = `record-level-permission-filter-${roleId}-${objectMetadataItem.id}`;

    return (
      <RecordFilterGroupsComponentInstanceContext.Provider
        value={{ instanceId }}
      >
        <RecordFiltersComponentInstanceContext.Provider value={{ instanceId }}>
          <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderContent
            roleId={roleId}
            objectMetadataItem={objectMetadataItem}
          />
        </RecordFiltersComponentInstanceContext.Provider>
      </RecordFilterGroupsComponentInstanceContext.Provider>
    );
  };
