/* @license Enterprise */

import { styled } from '@linaria/react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { isRecordFilterGroupChildARecordFilterGroup } from '@/object-record/advanced-filter/utils/isRecordFilterGroupChildARecordFilterGroup';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { getAllRecordFilterDescendantsOfRecordFilterGroup } from '@/object-record/record-filter/utils/getAllRecordFilterDescendantsOfRecordFilterGroup';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupRow } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupRow';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledChildren = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

type SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupChildrenProps =
  {
    recordFilterGroup: RecordFilterGroup;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupChildren =
  ({
    recordFilterGroup,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupChildrenProps) => {
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

    // Relation-backed predicates are not editable here, so a group holding only those would render empty
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
            <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupRow
              key={child.id}
              recordFilterGroup={child}
              parentRecordFilterGroup={recordFilterGroup}
              index={index}
            >
              <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupChildren
                recordFilterGroup={child}
              />
            </SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupRow>
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
