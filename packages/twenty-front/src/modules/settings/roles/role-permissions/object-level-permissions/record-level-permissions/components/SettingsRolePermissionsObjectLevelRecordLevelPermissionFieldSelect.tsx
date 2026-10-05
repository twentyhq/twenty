/* @license Enterprise */

import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Dropdown } from 'twenty-ui/components';

import { AdvancedFilterFieldSelectDropdownButtonClickableSelect } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectDropdownButtonClickableSelect';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectDropdownContent } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectDropdownContent';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

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

    return (
      <StyledContainer>
        <DropdownRoot
          dropdownId={advancedFilterFieldSelectDropdownId}
          type="picker"
        >
          <Dropdown.Trigger render={<div />} nativeButton={false}>
            <AdvancedFilterFieldSelectDropdownButtonClickableSelect
              recordFilterId={recordFilterId}
            />
          </Dropdown.Trigger>
          <DropdownContent
            aria-label={t`Select a filter field`}
            side="bottom"
            align="start"
            sideOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET}
            width={GenericDropdownContentWidth.ExtraLarge}
          >
            <SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectDropdownContent
              recordFilterId={recordFilterId}
            />
          </DropdownContent>
        </DropdownRoot>
      </StyledContainer>
    );
  };
