/* @license Enterprise */

import { useCallback, useEffect } from 'react';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import {
  convertRecordFilterGroupToPredicateGroup,
  convertRecordFilterToPredicate,
} from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/recordLevelPermissionPredicateConversion';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { type RowLevelPermissionPredicateScope } from '~/generated-metadata/graphql';

type UseRecordLevelPermissionSyncToDraftRoleProps = {
  roleId: string;
  scope: RowLevelPermissionPredicateScope;
  objectMetadataItem: EnrichedObjectMetadataItem;
  currentRecordFilters: RecordFilter[];
  currentRecordFilterGroups: RecordFilterGroup[];
  hasInitialized: boolean;
};

export const useRecordLevelPermissionSyncToDraftRole = ({
  roleId,
  scope,
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
      const otherObjectPredicates = (
        previousRole.rowLevelPermissionPredicates ?? []
      ).filter(
        (predicate) =>
          predicate.objectMetadataId !== objectMetadataItem.id ||
          predicate.scope !== scope,
      );

      const otherObjectGroups = (
        previousRole.rowLevelPermissionPredicateGroups ?? []
      ).filter(
        (group) =>
          group.objectMetadataId !== objectMetadataItem.id ||
          group.scope !== scope,
      );

      const newPredicates = currentRecordFilters.map((filter) =>
        convertRecordFilterToPredicate(
          filter,
          roleId,
          objectMetadataItem.id,
          scope,
        ),
      );

      const newPredicateGroups = currentRecordFilterGroups.map((group) =>
        convertRecordFilterGroupToPredicateGroup(
          group,
          roleId,
          objectMetadataItem.id,
          scope,
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
    scope,
    setSettingsDraftRole,
  ]);

  useEffect(() => {
    if (hasInitialized) {
      syncToDraftRole();
    }
  }, [syncToDraftRole, hasInitialized]);

  return { syncToDraftRole };
};
