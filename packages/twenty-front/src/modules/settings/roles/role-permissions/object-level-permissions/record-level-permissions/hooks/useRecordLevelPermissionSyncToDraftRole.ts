/* @license Enterprise */

import { useCallback, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import {
  convertRecordFilterGroupToPredicateGroup,
  convertRecordFilterToPredicate,
} from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/recordLevelPermissionPredicateConversion';
import { getRulePredicateGroupIds } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/getRulePredicateGroupIds';
import { replaceRuleItemsKeepingOrder } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/replaceRuleItemsKeepingOrder';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

type UseRecordLevelPermissionSyncToDraftRoleProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  ruleRootGroupId: string;
  currentRecordFilters: RecordFilter[];
  currentRecordFilterGroups: RecordFilterGroup[];
  hasInitialized: boolean;
};

export const useRecordLevelPermissionSyncToDraftRole = ({
  roleId,
  objectMetadataItem,
  ruleRootGroupId,
  currentRecordFilters,
  currentRecordFilterGroups,
  hasInitialized,
}: UseRecordLevelPermissionSyncToDraftRoleProps) => {
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const syncToDraftRole = useCallback(() => {
    setSettingsDraftRole((previousRole) => {
      const rulePredicateGroupIds = new Set([
        ...getRulePredicateGroupIds({
          predicateGroups: previousRole.rowLevelPermissionPredicateGroups ?? [],
          ruleRootGroupId,
        }),
        ...currentRecordFilterGroups.map((group) => group.id),
      ]);

      const newPredicates = currentRecordFilters.map((filter) =>
        convertRecordFilterToPredicate(filter, roleId, objectMetadataItem.id),
      );

      const previousPredicateGroupById = new Map(
        (previousRole.rowLevelPermissionPredicateGroups ?? []).map(
          (predicateGroup) => [predicateGroup.id, predicateGroup],
        ),
      );

      const newPredicateGroups = currentRecordFilterGroups.map((group) =>
        convertRecordFilterGroupToPredicateGroup({
          filterGroup: group,
          roleId,
          objectMetadataId: objectMetadataItem.id,
          existingPredicateGroup: previousPredicateGroupById.get(group.id),
        }),
      );

      return {
        ...previousRole,
        rowLevelPermissionPredicates: replaceRuleItemsKeepingOrder({
          previousItems: previousRole.rowLevelPermissionPredicates ?? [],
          nextRuleItems: newPredicates,
          isRuleItem: (predicate) =>
            predicate.objectMetadataId === objectMetadataItem.id &&
            !isDefined(predicate.relationFieldMetadataId) &&
            isDefined(predicate.rowLevelPermissionPredicateGroupId) &&
            rulePredicateGroupIds.has(
              predicate.rowLevelPermissionPredicateGroupId,
            ),
        }),
        rowLevelPermissionPredicateGroups: replaceRuleItemsKeepingOrder({
          previousItems: previousRole.rowLevelPermissionPredicateGroups ?? [],
          nextRuleItems: newPredicateGroups,
          isRuleItem: (predicateGroup) =>
            rulePredicateGroupIds.has(predicateGroup.id),
        }),
      };
    });
  }, [
    currentRecordFilters,
    currentRecordFilterGroups,
    objectMetadataItem.id,
    roleId,
    ruleRootGroupId,
    setSettingsDraftRole,
  ]);

  useEffect(() => {
    if (hasInitialized) {
      syncToDraftRole();
    }
  }, [syncToDraftRole, hasInitialized]);

  return { syncToDraftRole };
};
