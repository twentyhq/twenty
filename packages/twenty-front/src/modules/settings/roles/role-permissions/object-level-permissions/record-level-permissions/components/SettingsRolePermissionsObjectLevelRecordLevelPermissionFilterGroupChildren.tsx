/* @license Enterprise */

import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { isRecordFilterGroupChildARecordFilterGroup } from '@/object-record/advanced-filter/utils/isRecordFilterGroupChildARecordFilterGroup';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { getAllRecordFilterDescendantsOfRecordFilterGroup } from '@/object-record/record-filter/utils/getAllRecordFilterDescendantsOfRecordFilterGroup';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupOptionsDropdown } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupOptionsDropdown';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionLogicalOperatorCell } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionLogicalOperatorCell';
import { useRecordLevelPermissionFilterActions } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/hooks/useRecordLevelPermissionFilterActions';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledChildren = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

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

type SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupChildrenProps =
  {
    recordFilterGroup: RecordFilterGroup;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupChildren =
  ({
    recordFilterGroup,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupChildrenProps) => {
    const { objectMetadataItem } = useContext(AdvancedFilterContext);

    const currentRecordFilters = useAtomComponentStateValue(
      currentRecordFiltersComponentState,
    );

    const currentRecordFilterGroups = useAtomComponentStateValue(
      currentRecordFilterGroupsComponentState,
    );

    const { childRecordFiltersAndRecordFilterGroups } =
      useChildRecordFiltersAndRecordFilterGroups({
        recordFilterGroupId: recordFilterGroup.id,
      });

    const { handleAddFilter } = useRecordLevelPermissionFilterActions({
      objectMetadataItem,
    });

    // Groups holding no editable rule (e.g. only relation predicates) are kept but not shown
    const visibleChildren = childRecordFiltersAndRecordFilterGroups.filter(
      (child) =>
        !isRecordFilterGroupChildARecordFilterGroup(child) ||
        isNonEmptyArray(
          getAllRecordFilterDescendantsOfRecordFilterGroup({
            recordFilterGroupId: child.id,
            recordFilterGroups: currentRecordFilterGroups,
            recordFilters: currentRecordFilters,
          }),
        ),
    );

    return (
      <StyledChildren>
        {visibleChildren.map((child, index) =>
          isRecordFilterGroupChildARecordFilterGroup(child) ? (
            <StyledGroupRow key={child.id}>
              <SettingsRolePermissionsObjectLevelRecordLevelPermissionLogicalOperatorCell
                index={index}
                recordFilterGroup={recordFilterGroup}
              />
              <StyledGroupContainer>
                <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupChildren
                  recordFilterGroup={child}
                />
                <CommandMenuButton
                  command={{
                    Icon: IconPlus,
                    label: t`Add rule`,
                    shortLabel: t`Add rule`,
                    key: `add-rule-${child.id}`,
                  }}
                  onClick={() => handleAddFilter(child)}
                />
              </StyledGroupContainer>
              <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupOptionsDropdown
                recordFilterGroupId={child.id}
              />
            </StyledGroupRow>
          ) : (
            <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow
              key={child.id}
              recordFilter={child}
              index={index}
              recordFilterGroup={recordFilterGroup}
            />
          ),
        )}
      </StyledChildren>
    );
  };
