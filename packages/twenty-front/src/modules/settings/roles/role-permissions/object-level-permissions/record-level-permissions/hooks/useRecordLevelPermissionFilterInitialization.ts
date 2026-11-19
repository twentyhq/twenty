/* @license Enterprise */

import { useEffect, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import {
  convertPredicateGroupToRecordFilterGroup,
  convertPredicateToRecordFilter,
} from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/recordLevelPermissionPredicateConversion';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

type UseRecordLevelPermissionFilterInitializationProps = {
  roleId: string;
  ruleId: string;
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
  ruleId,
  settingsDraftRole,
  filterableFieldMetadataItems,
  setCurrentRecordFilters,
  setCurrentRecordFilterGroups,
  setRecordFilterUsedInAdvancedFilterDropdownRow,
}: UseRecordLevelPermissionFilterInitializationProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);
  const [lastInitializedRoleId, setLastInitializedRoleId] =
    useState<string>('');
  const [lastInitializedRuleId, setLastInitializedRuleId] =
    useState<string>('');

  const initialFilters = useMemo(() => {
    const predicates = settingsDraftRole.rowLevelPermissionPredicates ?? [];
    const rulePredicates = predicates.filter(
      (predicate) =>
        predicate.rowLevelPermissionRuleId === ruleId &&
        !isDefined(predicate.relationFieldMetadataId),
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
    ruleId,
    filterableFieldMetadataItems,
  ]);

  const initialFilterGroups = useMemo(
    () =>
      (settingsDraftRole.rowLevelPermissionPredicateGroups ?? [])
        .filter((group) => group.rowLevelPermissionRuleId === ruleId)
        .map(convertPredicateGroupToRecordFilterGroup),
    [settingsDraftRole.rowLevelPermissionPredicateGroups, ruleId],
  );

  useEffect(() => {
    const isRoleOrRuleChanged =
      lastInitializedRoleId !== roleId || lastInitializedRuleId !== ruleId;

    const isDraftRolePopulated = settingsDraftRole.id === roleId;

    const shouldInitialize =
      isDraftRolePopulated && (isRoleOrRuleChanged || !hasInitialized);

    if (shouldInitialize) {
      setCurrentRecordFilters(initialFilters);
      setCurrentRecordFilterGroups(initialFilterGroups);

      for (const filter of initialFilters) {
        setRecordFilterUsedInAdvancedFilterDropdownRow(filter);
      }

      setHasInitialized(true);
      setLastInitializedRoleId(roleId);
      setLastInitializedRuleId(ruleId);
    }
  }, [
    roleId,
    ruleId,
    settingsDraftRole.id,
    initialFilters,
    initialFilterGroups,
    hasInitialized,
    lastInitializedRoleId,
    lastInitializedRuleId,
    setCurrentRecordFilters,
    setCurrentRecordFilterGroups,
    setRecordFilterUsedInAdvancedFilterDropdownRow,
  ]);

  return {
    hasInitialized,
  };
};
