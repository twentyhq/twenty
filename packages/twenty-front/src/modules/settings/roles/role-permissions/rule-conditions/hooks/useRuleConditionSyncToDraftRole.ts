/* @license Enterprise */

import { useCallback, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import {
  convertRecordFilterGroupToPredicateGroup,
  convertRecordFilterToPredicate,
} from '@/settings/roles/role-permissions/rule-conditions/utils/rowLevelPermissionPredicateConversion';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

type UseRuleConditionSyncToDraftRoleProps = {
  roleId: string;
  rowLevelPermissionRuleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  currentRecordFilters: RecordFilter[];
  currentRecordFilterGroups: RecordFilterGroup[];
  hasInitialized: boolean;
};

export const useRuleConditionSyncToDraftRole = ({
  roleId,
  rowLevelPermissionRuleId,
  objectMetadataItem,
  currentRecordFilters,
  currentRecordFilterGroups,
  hasInitialized,
}: UseRuleConditionSyncToDraftRoleProps) => {
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const syncToDraftRole = useCallback(() => {
    setSettingsDraftRole((previousRole) => {
      const predicatesNotManagedByFilters = (
        previousRole.rowLevelPermissionPredicates ?? []
      ).filter(
        (predicate) =>
          predicate.rowLevelPermissionRuleId !== rowLevelPermissionRuleId ||
          isDefined(predicate.relationFieldMetadataId),
      );

      const otherRuleGroups = (
        previousRole.rowLevelPermissionPredicateGroups ?? []
      ).filter(
        (group) => group.rowLevelPermissionRuleId !== rowLevelPermissionRuleId,
      );

      const newPredicates = currentRecordFilters.map((filter) => ({
        ...convertRecordFilterToPredicate(
          filter,
          roleId,
          objectMetadataItem.id,
        ),
        rowLevelPermissionRuleId,
      }));

      const previousPredicateGroupById = new Map(
        (previousRole.rowLevelPermissionPredicateGroups ?? []).map(
          (predicateGroup) => [predicateGroup.id, predicateGroup],
        ),
      );

      const newPredicateGroups = currentRecordFilterGroups.map((group) => ({
        ...convertRecordFilterGroupToPredicateGroup({
          filterGroup: group,
          roleId,
          objectMetadataId: objectMetadataItem.id,
          existingPredicateGroup: previousPredicateGroupById.get(group.id),
        }),
        rowLevelPermissionRuleId,
      }));

      return {
        ...previousRole,
        rowLevelPermissionPredicates: [
          ...predicatesNotManagedByFilters,
          ...newPredicates,
        ],
        rowLevelPermissionPredicateGroups: [
          ...otherRuleGroups,
          ...newPredicateGroups,
        ],
      };
    });
  }, [
    currentRecordFilters,
    currentRecordFilterGroups,
    objectMetadataItem.id,
    roleId,
    rowLevelPermissionRuleId,
    setSettingsDraftRole,
  ]);

  useEffect(() => {
    if (hasInitialized) {
      syncToDraftRole();
    }
  }, [syncToDraftRole, hasInitialized]);

  return { syncToDraftRole };
};
