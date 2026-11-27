/* @license Enterprise */

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { SettingsRoleRuleConditionFilterBuilderContent } from '@/settings/roles/role-permissions/rule-conditions/components/SettingsRoleRuleConditionFilterBuilderContent';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';

type SettingsRoleRuleConditionFilterBuilderProps = {
  roleId: string;
  rowLevelPermissionRuleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const SettingsRoleRuleConditionFilterBuilder = ({
  roleId,
  rowLevelPermissionRuleId,
  objectMetadataItem,
}: SettingsRoleRuleConditionFilterBuilderProps) => {
  const instanceId = useWorkspaceSurfaceScopedComponentInstanceId(
    `rule-condition-filter-${roleId}-${rowLevelPermissionRuleId}`,
  );

  return (
    <RecordFilterGroupsComponentInstanceContext.Provider value={{ instanceId }}>
      <RecordFiltersComponentInstanceContext.Provider value={{ instanceId }}>
        <SettingsRoleRuleConditionFilterBuilderContent
          roleId={roleId}
          rowLevelPermissionRuleId={rowLevelPermissionRuleId}
          objectMetadataItem={objectMetadataItem}
        />
      </RecordFiltersComponentInstanceContext.Provider>
    </RecordFilterGroupsComponentInstanceContext.Provider>
  );
};
