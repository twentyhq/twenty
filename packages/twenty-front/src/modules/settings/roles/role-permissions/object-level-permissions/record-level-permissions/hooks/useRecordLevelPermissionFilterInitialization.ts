/* @license Enterprise */

import { useEffect, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import {
  convertPredicateGroupToRecordFilterGroup,
  convertPredicateToRecordFilter,
} from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/recordLevelPermissionPredicateConversion';
import { getRulePredicateGroupIds } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/getRulePredicateGroupIds';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

type UseRecordLevelPermissionFilterInitializationProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  ruleRootGroupId: string;
  settingsDraftRole: RoleWithPartialMembers;
  filterableFieldMetadataItems: FieldMetadataItem[];
  setCurrentRecordFilters: (filters: RecordFilter[]) => void;
  setCurrentRecordFilterGroups: (groups: RecordFilterGroup[]) => void;
  setRecordFilterUsedInAdvancedFilterDropdownRow: (
    filter: RecordFilter,
  ) => void;
};

export const useRecordLevelPermissionFilterInitialization = ({
  roleId,
  objectMetadataItem,
  ruleRootGroupId,
  settingsDraftRole,
  filterableFieldMetadataItems,
  setCurrentRecordFilters,
  setCurrentRecordFilterGroups,
  setRecordFilterUsedInAdvancedFilterDropdownRow,
}: UseRecordLevelPermissionFilterInitializationProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);
  const [lastInitializedRoleId, setLastInitializedRoleId] =
    useState<string>('');
  const [lastInitializedObjectId, setLastInitializedObjectId] =
    useState<string>('');

  const rulePredicateGroupIds = useMemo(
    () =>
      getRulePredicateGroupIds({
        predicateGroups:
          settingsDraftRole.rowLevelPermissionPredicateGroups ?? [],
        ruleRootGroupId,
      }),
    [settingsDraftRole.rowLevelPermissionPredicateGroups, ruleRootGroupId],
  );

  const initialFilters = useMemo(() => {
    const predicates = settingsDraftRole.rowLevelPermissionPredicates ?? [];
    const rulePredicates = predicates.filter(
      (predicate) =>
        predicate.objectMetadataId === objectMetadataItem.id &&
        !isDefined(predicate.relationFieldMetadataId) &&
        isDefined(predicate.rowLevelPermissionPredicateGroupId) &&
        rulePredicateGroupIds.has(predicate.rowLevelPermissionPredicateGroupId),
    );

    return rulePredicates
      .map((predicate) => {
        const fieldMetadataItem = filterableFieldMetadataItems.find(
          (fieldMetadataItemToFind) =>
            fieldMetadataItemToFind.id === predicate.fieldMetadataId,
        );
        return convertPredicateToRecordFilter(predicate, fieldMetadataItem);
      })
      .filter(isDefined);
  }, [
    settingsDraftRole.rowLevelPermissionPredicates,
    objectMetadataItem.id,
    filterableFieldMetadataItems,
    rulePredicateGroupIds,
  ]);

  const initialFilterGroups = useMemo(
    () =>
      (settingsDraftRole.rowLevelPermissionPredicateGroups ?? [])
        .filter((predicateGroup) =>
          rulePredicateGroupIds.has(predicateGroup.id),
        )
        .map(convertPredicateGroupToRecordFilterGroup),
    [
      settingsDraftRole.rowLevelPermissionPredicateGroups,
      rulePredicateGroupIds,
    ],
  );

  useEffect(() => {
    const isRoleOrObjectChanged =
      lastInitializedRoleId !== roleId ||
      lastInitializedObjectId !== `${objectMetadataItem.id}-${ruleRootGroupId}`;

    const isDraftRolePopulated = settingsDraftRole.id === roleId;

    const shouldInitialize =
      isDraftRolePopulated && (isRoleOrObjectChanged || !hasInitialized);

    if (shouldInitialize) {
      setCurrentRecordFilters(initialFilters);
      setCurrentRecordFilterGroups(initialFilterGroups);

      for (const filter of initialFilters) {
        setRecordFilterUsedInAdvancedFilterDropdownRow(filter);
      }

      setHasInitialized(true);
      setLastInitializedRoleId(roleId);
      setLastInitializedObjectId(`${objectMetadataItem.id}-${ruleRootGroupId}`);
    }
  }, [
    roleId,
    objectMetadataItem.id,
    ruleRootGroupId,
    settingsDraftRole.id,
    initialFilters,
    initialFilterGroups,
    hasInitialized,
    lastInitializedRoleId,
    lastInitializedObjectId,
    setCurrentRecordFilters,
    setCurrentRecordFilterGroups,
    setRecordFilterUsedInAdvancedFilterDropdownRow,
  ]);

  return {
    hasInitialized,
  };
};
