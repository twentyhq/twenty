/* @license Enterprise */

import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconFilter, IconLibraryPlus, IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useSetRecordFilterUsedInAdvancedFilterDropdownRow } from '@/object-record/advanced-filter/hooks/useSetRecordFilterUsedInAdvancedFilterDropdownRow';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupChildren } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupChildren';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow';
import { useRecordLevelPermissionFilterActions } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/hooks/useRecordLevelPermissionFilterActions';
import { useRecordLevelPermissionFilterInitialization } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/hooks/useRecordLevelPermissionFilterInitialization';
import { useRecordLevelPermissionSyncToDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/hooks/useRecordLevelPermissionSyncToDraftRole';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

const StyledContainer = styled.div`
  align-items: start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledFiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledRootGroupSeparator = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding-left: ${themeCssVariables.spacing[2]};
`;

const StyledActionButtonWrapper = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

type SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderContentProps =
  {
    roleId: string;
    objectMetadataItem: EnrichedObjectMetadataItem;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderContent =
  ({
    roleId,
    objectMetadataItem,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderContentProps) => {
    const settingsDraftRole = useAtomFamilyStateValue(
      settingsDraftRoleFamilyState,
      roleId,
    );

    const { filterableFieldMetadataItems } = useFilterableFieldMetadataItems(
      objectMetadataItem.id,
    );

    const setCurrentRecordFilters = useSetAtomComponentState(
      currentRecordFiltersComponentState,
    );

    const setCurrentRecordFilterGroups = useSetAtomComponentState(
      currentRecordFilterGroupsComponentState,
    );

    const currentRecordFilters = useAtomComponentStateValue(
      currentRecordFiltersComponentState,
    );

    const currentRecordFilterGroups = useAtomComponentStateValue(
      currentRecordFilterGroupsComponentState,
    );

    const { setRecordFilterUsedInAdvancedFilterDropdownRow } =
      useSetRecordFilterUsedInAdvancedFilterDropdownRow();

    const rootRecordFilterGroup = useAtomComponentSelectorValue(
      rootLevelRecordFilterGroupComponentSelector,
    );

    // Kept out of the root group: the server ANDs them with it, so an OR group would widen access
    const ungroupedRecordFilters = currentRecordFilters.filter(
      (recordFilter) => !isDefined(recordFilter.recordFilterGroupId),
    );

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

    const { handleCreateFirstFilter, handleAddFilter, handleAddFilterGroup } =
      useRecordLevelPermissionFilterActions({
        objectMetadataItem,
      });

    return (
      <AdvancedFilterContext.Provider value={{ objectMetadataItem }}>
        <StyledContainer>
          {isNonEmptyArray(ungroupedRecordFilters) && (
            <StyledFiltersContainer>
              {ungroupedRecordFilters.map((recordFilter, index) => (
                <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow
                  key={recordFilter.id}
                  recordFilter={recordFilter}
                  index={index}
                />
              ))}
            </StyledFiltersContainer>
          )}
          {isDefined(rootRecordFilterGroup) ? (
            <>
              {isNonEmptyArray(ungroupedRecordFilters) && (
                <StyledRootGroupSeparator>{t`And`}</StyledRootGroupSeparator>
              )}
              <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupChildren
                recordFilterGroup={rootRecordFilterGroup}
              />
              <StyledActionButtonWrapper>
                <CommandMenuButton
                  command={{
                    Icon: IconPlus,
                    label: t`Add rule`,
                    shortLabel: t`Add rule`,
                    key: 'add-rule',
                  }}
                  onClick={() => handleAddFilter(rootRecordFilterGroup)}
                />
                <CommandMenuButton
                  command={{
                    Icon: IconLibraryPlus,
                    label: t`Add rule group`,
                    shortLabel: t`Add rule group`,
                    key: 'add-rule-group',
                  }}
                  onClick={() => handleAddFilterGroup(rootRecordFilterGroup)}
                />
              </StyledActionButtonWrapper>
            </>
          ) : (
            <Button
              startIcon={<IconFilter />}
              size="sm"
              onClick={handleCreateFirstFilter}
              aria-label={t`Add filter`}
              variant="outline"
            >{t`Add filter`}</Button>
          )}
        </StyledContainer>
      </AdvancedFilterContext.Provider>
    );
  };
