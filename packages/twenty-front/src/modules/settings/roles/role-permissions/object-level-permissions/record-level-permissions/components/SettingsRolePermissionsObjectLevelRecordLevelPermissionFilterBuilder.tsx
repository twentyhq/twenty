/* @license Enterprise */

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderContent } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderContent';
import { type RowLevelPermissionPredicateScope } from '~/generated-metadata/graphql';

type SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderProps =
  {
    roleId: string;
    scope: RowLevelPermissionPredicateScope;
    objectMetadataItem: EnrichedObjectMetadataItem;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder =
  ({
    roleId,
    scope,
    objectMetadataItem,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderProps) => {
    const instanceId = `record-level-permission-filter-${roleId}-${objectMetadataItem.id}-${scope}`;

    return (
      <RecordFilterGroupsComponentInstanceContext.Provider
        value={{ instanceId }}
      >
        <RecordFiltersComponentInstanceContext.Provider value={{ instanceId }}>
          <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderContent
            roleId={roleId}
            scope={scope}
            objectMetadataItem={objectMetadataItem}
          />
        </RecordFiltersComponentInstanceContext.Provider>
      </RecordFilterGroupsComponentInstanceContext.Provider>
    );
  };
