/* @license Enterprise */

import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactNode, useContext } from 'react';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { AdvancedFilterRecordFilterGroupOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupOptionsDropdown';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionLogicalOperatorCell } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionLogicalOperatorCell';
import { useRecordLevelPermissionFilterActions } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/hooks/useRecordLevelPermissionFilterActions';

const StyledGroupRow = styled.div`
  align-items: start;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledGroupContainer = styled.div`
  align-items: start;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[2]};
`;

type SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupRowProps =
  {
    recordFilterGroup: RecordFilterGroup;
    parentRecordFilterGroup: RecordFilterGroup;
    index: number;
    children: ReactNode;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupRow =
  ({
    recordFilterGroup,
    parentRecordFilterGroup,
    index,
    children,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupRowProps) => {
    const { objectMetadataItem } = useContext(AdvancedFilterContext);

    const { handleAddFilter } = useRecordLevelPermissionFilterActions({
      objectMetadataItem,
    });

    return (
      <StyledGroupRow>
        <SettingsRolePermissionsObjectLevelRecordLevelPermissionLogicalOperatorCell
          index={index}
          recordFilterGroup={parentRecordFilterGroup}
        />
        <StyledGroupContainer>
          {children}
          <CommandMenuButton
            command={{
              Icon: IconPlus,
              label: t`Add rule`,
              shortLabel: t`Add rule`,
              key: `add-rule-${recordFilterGroup.id}`,
            }}
            onClick={() => handleAddFilter(recordFilterGroup)}
          />
        </StyledGroupContainer>
        <AdvancedFilterRecordFilterGroupOptionsDropdown
          recordFilterGroupId={recordFilterGroup.id}
        />
      </StyledGroupRow>
    );
  };
