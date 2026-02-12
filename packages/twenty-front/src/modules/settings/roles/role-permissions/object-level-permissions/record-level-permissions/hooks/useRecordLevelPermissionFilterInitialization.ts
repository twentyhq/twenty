/* @license Enterprise */

import { useEffect, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import {
  convertPredicateGroupToRecordFilterGroup,
  convertPredicateToRecordFilter,
} from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/recordLevelPermissionPredicateConversion';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

type UseRecordLevelPermissionFilterInitializationProps = {
  roleId: string;
  objectMetadataItem: ObjectMetadataItem;
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

  const initialFilters = useMemo(() => {
    const predicates = settingsDraftRole.rowLevelPermissionPredicates ?? [];
    const objectPredicates = predicates.filter(
      (predicate) => predicate.objectMetadataId === objectMetadataItem.id,
    );

    return objectPredicates
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
  ]);

  const initialFilterGroups = useMemo(() => {
    const predicateGroups =
      settingsDraftRole.rowLevelPermissionPredicateGroups ?? [];

    const objectPredicateGroupIds = new Set(
      (settingsDraftRole.rowLevelPermissionPredicates ?? [])
        .filter(
          (predicate) => predicate.objectMetadataId === objectMetadataItem.id,
        )
        .map((predicate) => predicate.rowLevelPermissionPredicateGroupId)
        .filter(isDefined),
    );

    const relevantGroups = predicateGroups.filter(
      (group) =>
        objectPredicateGroupIds.has(group.id) ||
        (isDefined(group.parentRowLevelPermissionPredicateGroupId) &&
          objectPredicateGroupIds.has(
            group.parentRowLevelPermissionPredicateGroupId,
          )),
    );

    const rootGroups = predicateGroups.filter(
      (group) =>
        !group.parentRowLevelPermissionPredicateGroupId &&
        relevantGroups.some(
          (relevantGroup) =>
            relevantGroup.id === group.id ||
            relevantGroup.parentRowLevelPermissionPredicateGroupId === group.id,
        ),
    );

    const allRelevantGroups = [...new Set([...rootGroups, ...relevantGroups])];

    return allRelevantGroups.map(convertPredicateGroupToRecordFilterGroup);
  }, [
    settingsDraftRole.rowLevelPermissionPredicateGroups,
    settingsDraftRole.rowLevelPermissionPredicates,
    objectMetadataItem.id,
  ]);

  useEffect(() => {
    const isRoleOrObjectChanged =
      lastInitializedRoleId !== roleId ||
      lastInitializedObjectId !== objectMetadataItem.id;

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
      setLastInitializedObjectId(objectMetadataItem.id);
    }
  }, [
    roleId,
    objectMetadataItem.id,
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
