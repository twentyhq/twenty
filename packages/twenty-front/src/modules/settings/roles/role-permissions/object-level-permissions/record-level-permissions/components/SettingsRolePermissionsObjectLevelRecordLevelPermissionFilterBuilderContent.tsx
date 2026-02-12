/* @license Enterprise */

import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

import { ActionButton } from '@/action-menu/actions/display/components/ActionButton';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { useSetRecordFilterUsedInAdvancedFilterDropdownRow } from '@/object-record/advanced-filter/hooks/useSetRecordFilterUsedInAdvancedFilterDropdownRow';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { isRecordFilterGroupChildARecordFilterGroup } from '@/object-record/advanced-filter/utils/isRecordFilterGroupChildARecordFilterGroup';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow';
import { useRecordLevelPermissionFilterActions } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/hooks/useRecordLevelPermissionFilterActions';
import { useRecordLevelPermissionFilterInitialization } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/hooks/useRecordLevelPermissionFilterInitialization';
import { useRecordLevelPermissionSyncToDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/hooks/useRecordLevelPermissionSyncToDraftRole';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

const StyledContainer = styled.div`
  align-items: start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledActionButtonWrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

type SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderContentProps =
  {
    roleId: string;
    objectMetadataItem: ObjectMetadataItem;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderContent =
  ({
    roleId,
    objectMetadataItem,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderContentProps) => {
    const settingsDraftRole = useRecoilValue(
      settingsDraftRoleFamilyState(roleId),
    );

    const { filterableFieldMetadataItems } = useFilterableFieldMetadataItems(
      objectMetadataItem.id,
    );

    const setCurrentRecordFilters = useSetRecoilComponentState(
      currentRecordFiltersComponentState,
    );

    const setCurrentRecordFilterGroups = useSetRecoilComponentState(
      currentRecordFilterGroupsComponentState,
    );

    const currentRecordFilters = useRecoilComponentValue(
      currentRecordFiltersComponentState,
    );

    const currentRecordFilterGroups = useRecoilComponentValue(
      currentRecordFilterGroupsComponentState,
    );

    const { setRecordFilterUsedInAdvancedFilterDropdownRow } =
      useSetRecordFilterUsedInAdvancedFilterDropdownRow();

    const rootRecordFilterGroup = useRecoilComponentValue(
      rootLevelRecordFilterGroupComponentSelector,
    );

    const { childRecordFiltersAndRecordFilterGroups } =
      useChildRecordFiltersAndRecordFilterGroups({
        recordFilterGroupId: rootRecordFilterGroup?.id,
      });

    const { hasInitialized } = useRecordLevelPermissionFilterInitialization({
      roleId,
      objectMetadataItem,
      settingsDraftRole,
      filterableFieldMetadataItems,
      setCurrentRecordFilters,
      setCurrentRecordFilterGroups,
      setRecordFilterUsedInAdvancedFilterDropdownRow,
    });

    useRecordLevelPermissionSyncToDraftRole({
      roleId,
      objectMetadataItem,
      currentRecordFilters,
      currentRecordFilterGroups,
      hasInitialized,
    });

    const { handleCreateFirstFilter, handleAddFilter } =
      useRecordLevelPermissionFilterActions({
        objectMetadataItem,
      });

    return (
      <AdvancedFilterContext.Provider value={{ objectMetadataItem }}>
        {isDefined(rootRecordFilterGroup) ? (
          <StyledContainer>
            <StyledFiltersContainer>
              {childRecordFiltersAndRecordFilterGroups
                .filter(
                  (child): child is RecordFilter =>
                    !isRecordFilterGroupChildARecordFilterGroup(child),
                )
                .map((child, index) => (
                  <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow
                    key={child.id}
                    recordFilter={child}
                    index={index}
                    recordFilterGroup={rootRecordFilterGroup}
                  />
                ))}
            </StyledFiltersContainer>
            <StyledActionButtonWrapper>
              <ActionButton
                action={{
                  Icon: IconPlus,
                  label: t`Add rule`,
                  shortLabel: t`Add rule`,
                  key: 'add-rule',
                }}
                onClick={() => handleAddFilter(rootRecordFilterGroup)}
              />
            </StyledActionButtonWrapper>
          </StyledContainer>
        ) : (
          <Button
            Icon={IconFilter}
            size="small"
            variant="secondary"
            accent="default"
            onClick={handleCreateFirstFilter}
            ariaLabel={t`Add filter`}
            title={t`Add filter`}
          />
        )}
      </AdvancedFilterContext.Provider>
    );
  };
