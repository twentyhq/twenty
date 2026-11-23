/* @license Enterprise */

import { styled } from '@linaria/react';

import { AdvancedFilterSidePanelRecordFilterOperandSelect } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelRecordFilterOperandSelect';
import { AdvancedFilterRecordFilterOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOptionsDropdown';
import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { SettingsRoleRuleConditionFieldSelect } from '@/settings/roles/role-permissions/rule-conditions/components/SettingsRoleRuleConditionFieldSelect';
import { SettingsRoleRuleConditionLogicalOperatorCell } from '@/settings/roles/role-permissions/rule-conditions/components/SettingsRoleRuleConditionLogicalOperatorCell';
import { SettingsRoleRuleConditionValueInput } from '@/settings/roles/role-permissions/rule-conditions/components/SettingsRoleRuleConditionValueInput';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFilterRow = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledOperandSelectContainer = styled.div`
  text-transform: lowercase;
  width: ${themeCssVariables.spacing[13]};
`;

type SettingsRoleRuleConditionFilterRowProps = {
  recordFilter: RecordFilter;
  index: number;
  recordFilterGroup: RecordFilterGroup;
};

export const SettingsRoleRuleConditionFilterRow = ({
  recordFilter,
  index,
  recordFilterGroup,
}: SettingsRoleRuleConditionFilterRowProps) => {
  return (
    <ObjectFilterDropdownComponentInstanceContext.Provider
      value={{
        instanceId: getAdvancedFilterObjectFilterDropdownComponentInstanceId(
          recordFilter.id,
        ),
      }}
    >
      <StyledFilterRow>
        <SettingsRoleRuleConditionLogicalOperatorCell
          index={index}
          recordFilterGroup={recordFilterGroup}
        />
        <SettingsRoleRuleConditionFieldSelect
          recordFilterId={recordFilter.id}
        />
        <StyledOperandSelectContainer>
          <AdvancedFilterSidePanelRecordFilterOperandSelect
            recordFilterId={recordFilter.id}
          />
        </StyledOperandSelectContainer>
        <SettingsRoleRuleConditionValueInput recordFilterId={recordFilter.id} />
        <AdvancedFilterRecordFilterOptionsDropdown
          recordFilterId={recordFilter.id}
        />
      </StyledFilterRow>
    </ObjectFilterDropdownComponentInstanceContext.Provider>
  );
};
