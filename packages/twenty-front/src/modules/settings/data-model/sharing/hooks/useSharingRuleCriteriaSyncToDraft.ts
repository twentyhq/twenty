/* @license Enterprise */

import { useEffect } from 'react';

import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { settingsDraftSharingRuleFamilyState } from '@/settings/data-model/sharing/states/settingsDraftSharingRuleFamilyState';
import {
  convertRecordFilterGroupToPredicateGroup,
  convertRecordFilterToPredicate,
} from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/recordLevelPermissionPredicateConversion';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

type UseSharingRuleCriteriaSyncToDraftProps = {
  sharingRuleId: string;
  objectMetadataId: string;
  currentRecordFilters: RecordFilter[];
  currentRecordFilterGroups: RecordFilterGroup[];
  hasInitialized: boolean;
};

export const useSharingRuleCriteriaSyncToDraft = ({
  sharingRuleId,
  objectMetadataId,
  currentRecordFilters,
  currentRecordFilterGroups,
  hasInitialized,
}: UseSharingRuleCriteriaSyncToDraftProps) => {
  const setSettingsDraftSharingRule = useSetAtomFamilyState(
    settingsDraftSharingRuleFamilyState,
    sharingRuleId,
  );

  useEffect(() => {
    if (!hasInitialized) {
      return;
    }

    setSettingsDraftSharingRule((previousDraft) => ({
      ...previousDraft,
      rowLevelPermissionPredicates: currentRecordFilters.map((filter) =>
        convertRecordFilterToPredicate(
          filter,
          { sharingRuleId },
          objectMetadataId,
        ),
      ),
      rowLevelPermissionPredicateGroups: currentRecordFilterGroups.map(
        (group) =>
          convertRecordFilterGroupToPredicateGroup(
            group,
            { sharingRuleId },
            objectMetadataId,
          ),
      ),
    }));
  }, [
    hasInitialized,
    sharingRuleId,
    objectMetadataId,
    currentRecordFilters,
    currentRecordFilterGroups,
    setSettingsDraftSharingRule,
  ]);
};
