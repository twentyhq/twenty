/* @license Enterprise */

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter, IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { useSetRecordFilterUsedInAdvancedFilterDropdownRow } from '@/object-record/advanced-filter/hooks/useSetRecordFilterUsedInAdvancedFilterDropdownRow';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { isRecordFilterGroupChildARecordFilterGroup } from '@/object-record/advanced-filter/utils/isRecordFilterGroupChildARecordFilterGroup';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useSharingRuleCriteriaInitialization } from '@/settings/data-model/sharing/hooks/useSharingRuleCriteriaInitialization';
import { useSharingRuleCriteriaSyncToDraft } from '@/settings/data-model/sharing/hooks/useSharingRuleCriteriaSyncToDraft';
import { settingsDraftSharingRuleFamilyState } from '@/settings/data-model/sharing/states/settingsDraftSharingRuleFamilyState';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow';
import { useRecordLevelPermissionFilterActions } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/hooks/useRecordLevelPermissionFilterActions';
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

type SettingsObjectSharingRuleCriteriaFilterBuilderContentProps = {
  sharingRuleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const SettingsObjectSharingRuleCriteriaFilterBuilderContent = ({
  sharingRuleId,
  objectMetadataItem,
}: SettingsObjectSharingRuleCriteriaFilterBuilderContentProps) => {
  const { t } = useLingui();

  const settingsDraftSharingRule = useAtomFamilyStateValue(
    settingsDraftSharingRuleFamilyState,
    sharingRuleId,
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

  const { childRecordFiltersAndRecordFilterGroups } =
    useChildRecordFiltersAndRecordFilterGroups({
      recordFilterGroupId: rootRecordFilterGroup?.id,
    });

  const { hasInitialized } = useSharingRuleCriteriaInitialization({
    sharingRuleId,
    settingsDraftSharingRule,
    filterableFieldMetadataItems,
    setCurrentRecordFilters,
    setCurrentRecordFilterGroups,
    setRecordFilterUsedInAdvancedFilterDropdownRow,
  });

  useSharingRuleCriteriaSyncToDraft({
    sharingRuleId,
    objectMetadataId: objectMetadataItem.id,
    currentRecordFilters,
    currentRecordFilterGroups,
    hasInitialized,
  });

  const { handleCreateFirstFilter, handleAddFilter } =
    useRecordLevelPermissionFilterActions({ objectMetadataItem });

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
          <CommandMenuButton
            command={{
              Icon: IconPlus,
              label: t`Add criterion`,
              shortLabel: t`Add criterion`,
              key: 'add-criterion',
            }}
            onClick={() => handleAddFilter(rootRecordFilterGroup)}
          />
        </StyledContainer>
      ) : (
        <Button
          Icon={IconFilter}
          size="small"
          variant="secondary"
          accent="default"
          onClick={handleCreateFirstFilter}
          ariaLabel={t`Add criterion`}
          title={t`Add criterion`}
        />
      )}
    </AdvancedFilterContext.Provider>
  );
};
