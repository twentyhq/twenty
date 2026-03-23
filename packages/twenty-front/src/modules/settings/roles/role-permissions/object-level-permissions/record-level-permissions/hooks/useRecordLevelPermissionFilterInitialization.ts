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
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { type RowLevelPermissionPredicateScope } from '~/generated-metadata/graphql';

type UseRecordLevelPermissionFilterInitializationProps = {
  roleId: string;
  scope: RowLevelPermissionPredicateScope;
  objectMetadataItem: EnrichedObjectMetadataItem;
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
  scope,
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
      (predicate) =>
        predicate.objectMetadataId === objectMetadataItem.id &&
        predicate.scope === scope,
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
    scope,
    filterableFieldMetadataItems,
  ]);

  const initialFilterGroups = useMemo(() => {
    const predicateGroups = (
      settingsDraftRole.rowLevelPermissionPredicateGroups ?? []
    ).filter(
      (group) =>
        group.objectMetadataId === objectMetadataItem.id &&
        group.scope === scope,
    );

    const objectPredicateGroupIds = new Set(
      (settingsDraftRole.rowLevelPermissionPredicates ?? [])
        .filter(
          (predicate) =>
            predicate.objectMetadataId === objectMetadataItem.id &&
            predicate.scope === scope,
        )
        .map((predicate) => predicate.rowLevelPermissionPredicateGroupId)
        .filter(isDefined),
    );

    const groupsById = new Map(
      predicateGroups.map((predicateGroup) => [
        predicateGroup.id,
        predicateGroup,
      ]),
    );

    for (const groupId of [...objectPredicateGroupIds]) {
      let currentGroupId: string | null | undefined = groupId;

      while (isDefined(currentGroupId)) {
        const currentGroup = groupsById.get(currentGroupId);

        if (!isDefined(currentGroup)) {
          break;
        }

        objectPredicateGroupIds.add(currentGroup.id);
        currentGroupId = currentGroup.parentRowLevelPermissionPredicateGroupId;
      }
    }

    return predicateGroups
      .filter((group) => objectPredicateGroupIds.has(group.id))
      .map(convertPredicateGroupToRecordFilterGroup);
  }, [
    settingsDraftRole.rowLevelPermissionPredicateGroups,
    settingsDraftRole.rowLevelPermissionPredicates,
    objectMetadataItem.id,
    scope,
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
