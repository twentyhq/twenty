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
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

type UseRecordLevelPermissionSyncToDraftRoleProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  currentRecordFilters: RecordFilter[];
  currentRecordFilterGroups: RecordFilterGroup[];
  hasInitialized: boolean;
};

export const useRecordLevelPermissionSyncToDraftRole = ({
  roleId,
  objectMetadataItem,
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
      const predicatesNotManagedByFilters = (
        previousRole.rowLevelPermissionPredicates ?? []
      ).filter(
        (predicate) =>
          predicate.objectMetadataId !== objectMetadataItem.id ||
          isDefined(predicate.relationFieldMetadataId),
      );

      const previousPredicateGroups =
        previousRole.rowLevelPermissionPredicateGroups ?? [];

      const previousPredicateGroupById = new Map(
        previousPredicateGroups.map((group) => [group.id, group]),
      );

      // Predicates the builder does not edit keep their group chain, even if its rules were removed here
      const groupIdsNeededByPredicatesNotManagedByFilters = new Set<string>();

      for (const predicate of predicatesNotManagedByFilters) {
        let groupId: string | null | undefined =
          predicate.rowLevelPermissionPredicateGroupId;

        while (
          isDefined(groupId) &&
          !groupIdsNeededByPredicatesNotManagedByFilters.has(groupId)
        ) {
          groupIdsNeededByPredicatesNotManagedByFilters.add(groupId);
          groupId =
            previousPredicateGroupById.get(
              groupId,
            )?.parentRowLevelPermissionPredicateGroupId;
        }
      }

      const currentGroupIds = new Set(
        currentRecordFilterGroups.map((group) => group.id),
      );

      const otherObjectGroups = previousPredicateGroups.filter(
        (group) =>
          !currentGroupIds.has(group.id) &&
          (group.objectMetadataId !== objectMetadataItem.id ||
            groupIdsNeededByPredicatesNotManagedByFilters.has(group.id)),
      );

      const newPredicates = currentRecordFilters.map((filter) =>
        convertRecordFilterToPredicate(filter, roleId, objectMetadataItem.id),
      );

      const newPredicateGroups = currentRecordFilterGroups.map((group) =>
        convertRecordFilterGroupToPredicateGroup(
          group,
          roleId,
          objectMetadataItem.id,
        ),
      );

      return {
        ...previousRole,
        rowLevelPermissionPredicates: [
          ...predicatesNotManagedByFilters,
          ...newPredicates,
        ],
        rowLevelPermissionPredicateGroups: [
          ...otherObjectGroups,
          ...newPredicateGroups,
        ],
      };
    });
  }, [
    currentRecordFilters,
    currentRecordFilterGroups,
    objectMetadataItem.id,
    roleId,
    setSettingsDraftRole,
  ]);

  useEffect(() => {
    if (hasInitialized) {
      syncToDraftRole();
    }
  }, [syncToDraftRole, hasInitialized]);

  return { syncToDraftRole };
};
