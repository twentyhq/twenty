/* @license Enterprise */

import { useCallback, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import {
  convertRecordFilterGroupToPredicateGroup,
  convertRecordFilterToPredicate,
} from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/recordLevelPermissionPredicateConversion';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';

type UseRecordLevelPermissionSyncToDraftRoleProps = {
  roleId: string;
  objectMetadataItem: ObjectMetadataItem;
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
  const setSettingsDraftRole = useSetRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const syncToDraftRole = useCallback(() => {
    setSettingsDraftRole((previousRole) => {
      const otherObjectPredicates = (
        previousRole.rowLevelPermissionPredicates ?? []
      ).filter(
        (predicate) => predicate.objectMetadataId !== objectMetadataItem.id,
      );

      const currentObjectGroupIds = new Set(
        currentRecordFilters
          .map((filter) => filter.recordFilterGroupId)
          .filter(isDefined),
      );

      const currentObjectRootGroupIds = new Set(
        currentRecordFilterGroups
          .filter((group) => !group.parentRecordFilterGroupId)
          .map((group) => group.id),
      );

      const otherObjectGroups = (
        previousRole.rowLevelPermissionPredicateGroups ?? []
      ).filter(
        (group) =>
          !currentObjectGroupIds.has(group.id) &&
          !currentObjectRootGroupIds.has(group.id),
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
          ...otherObjectPredicates,
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
