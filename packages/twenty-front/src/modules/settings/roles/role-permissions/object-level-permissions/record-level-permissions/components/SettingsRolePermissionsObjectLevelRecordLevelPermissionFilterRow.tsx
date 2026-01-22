/* @license Enterprise */

import styled from '@emotion/styled';

import { AdvancedFilterCommandMenuRecordFilterOperandSelect } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuRecordFilterOperandSelect';
import { AdvancedFilterRecordFilterOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOptionsDropdown';
import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelect } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelect';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionLogicalOperatorCell } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionLogicalOperatorCell';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionValueInput } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionValueInput';

const StyledFilterRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledOperandSelectContainer = styled.div`
  width: 50px;
`;

type SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRowProps = {
  recordFilter: RecordFilter;
  index: number;
  recordFilterGroup: RecordFilterGroup;
};

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow =
  ({
    recordFilter,
    index,
    recordFilterGroup,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRowProps) => {
    return (
      <ObjectFilterDropdownComponentInstanceContext.Provider
        value={{
          instanceId: getAdvancedFilterObjectFilterDropdownComponentInstanceId(
            recordFilter.id,
          ),
        }}
      >
        <StyledFilterRow>
          <SettingsRolePermissionsObjectLevelRecordLevelPermissionLogicalOperatorCell
            index={index}
            recordFilterGroup={recordFilterGroup}
          />
          <SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelect
            recordFilterId={recordFilter.id}
          />
          <StyledOperandSelectContainer>
            <AdvancedFilterCommandMenuRecordFilterOperandSelect
              recordFilterId={recordFilter.id}
            />
          </StyledOperandSelectContainer>
          <SettingsRolePermissionsObjectLevelRecordLevelPermissionValueInput
            recordFilterId={recordFilter.id}
          />
          <AdvancedFilterRecordFilterOptionsDropdown
            recordFilterId={recordFilter.id}
          />
        </StyledFilterRow>
      </ObjectFilterDropdownComponentInstanceContext.Provider>
    );
  };
