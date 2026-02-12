/* @license Enterprise */

import styled from '@emotion/styled';

import { AdvancedFilterFieldSelectDropdownButtonClickableSelect } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectDropdownButtonClickableSelect';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectFieldMenu } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectFieldMenu';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectSubFieldMenu } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectSubFieldMenu';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';

const StyledContainer = styled.div`
  flex: 2;
  min-width: 0;
`;

type SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectProps = {
  recordFilterId: string;
};

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelect =
  ({
    recordFilterId,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectProps) => {
    const { advancedFilterFieldSelectDropdownId } =
      useAdvancedFilterFieldSelectDropdown(recordFilterId);

    const [objectFilterDropdownIsSelectingCompositeField] =
      useRecoilComponentState(
        objectFilterDropdownIsSelectingCompositeFieldComponentState,
      );

    return (
      <StyledContainer>
        <Dropdown
          dropdownId={advancedFilterFieldSelectDropdownId}
          clickableComponent={
            <AdvancedFilterFieldSelectDropdownButtonClickableSelect
              recordFilterId={recordFilterId}
            />
          }
          dropdownComponents={
            objectFilterDropdownIsSelectingCompositeField ? (
              <SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectSubFieldMenu
                recordFilterId={recordFilterId}
              />
            ) : (
              <SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectFieldMenu
                recordFilterId={recordFilterId}
              />
            )
          }
          dropdownOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET}
          dropdownPlacement="bottom-start"
        />
      </StyledContainer>
    );
  };
