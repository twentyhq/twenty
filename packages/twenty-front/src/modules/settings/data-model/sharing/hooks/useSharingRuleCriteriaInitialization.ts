/* @license Enterprise */

import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type SettingsDraftSharingRule } from '@/settings/data-model/sharing/states/settingsDraftSharingRuleFamilyState';
import {
  convertPredicateGroupToRecordFilterGroup,
  convertPredicateToRecordFilter,
} from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/recordLevelPermissionPredicateConversion';

type UseSharingRuleCriteriaInitializationProps = {
  sharingRuleId: string;
  settingsDraftSharingRule: SettingsDraftSharingRule;
  filterableFieldMetadataItems: FieldMetadataItem[];
  setCurrentRecordFilters: (filters: RecordFilter[]) => void;
  setCurrentRecordFilterGroups: (groups: RecordFilterGroup[]) => void;
  setRecordFilterUsedInAdvancedFilterDropdownRow: (
    filter: RecordFilter,
  ) => void;
};

export const useSharingRuleCriteriaInitialization = ({
  sharingRuleId,
  settingsDraftSharingRule,
  filterableFieldMetadataItems,
  setCurrentRecordFilters,
  setCurrentRecordFilterGroups,
  setRecordFilterUsedInAdvancedFilterDropdownRow,
}: UseSharingRuleCriteriaInitializationProps) => {
  const [initializedSharingRuleId, setInitializedSharingRuleId] = useState<
    string | null
  >(null);

  const hasInitialized = initializedSharingRuleId === sharingRuleId;

  useEffect(() => {
    if (hasInitialized || settingsDraftSharingRule.id !== sharingRuleId) {
      return;
    }

    const initialFilters = settingsDraftSharingRule.rowLevelPermissionPredicates
      .map((predicate) =>
        convertPredicateToRecordFilter(
          predicate,
          filterableFieldMetadataItems.find(
            (fieldMetadataItem) =>
              fieldMetadataItem.id === predicate.fieldMetadataId,
          ),
        ),
      )
      .filter(isDefined);

    setCurrentRecordFilters(initialFilters);
    setCurrentRecordFilterGroups(
      settingsDraftSharingRule.rowLevelPermissionPredicateGroups.map(
        convertPredicateGroupToRecordFilterGroup,
      ),
    );

    for (const filter of initialFilters) {
      setRecordFilterUsedInAdvancedFilterDropdownRow(filter);
    }

    setInitializedSharingRuleId(sharingRuleId);
  }, [
    hasInitialized,
    sharingRuleId,
    settingsDraftSharingRule,
    filterableFieldMetadataItems,
    setCurrentRecordFilters,
    setCurrentRecordFilterGroups,
    setRecordFilterUsedInAdvancedFilterDropdownRow,
  ]);

  return { hasInitialized };
};
