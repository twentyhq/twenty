/* @license Enterprise */

import { useEffect, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import {
  convertPredicateGroupToRecordFilterGroup,
  convertPredicateToRecordFilter,
} from '@/settings/roles/role-permissions/rule-conditions/utils/rowLevelPermissionPredicateConversion';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

type UseRuleConditionFilterInitializationProps = {
  roleId: string;
  rowLevelPermissionRuleId: string;
  settingsDraftRole: RoleWithPartialMembers;
  filterableFieldMetadataItems: FieldMetadataItem[];
  setCurrentRecordFilters: (filters: RecordFilter[]) => void;
  setCurrentRecordFilterGroups: (groups: RecordFilterGroup[]) => void;
  setRecordFilterUsedInAdvancedFilterDropdownRow: (
    filter: RecordFilter,
  ) => void;
};

export const useRuleConditionFilterInitialization = ({
  roleId,
  rowLevelPermissionRuleId,
  settingsDraftRole,
  filterableFieldMetadataItems,
  setCurrentRecordFilters,
  setCurrentRecordFilterGroups,
  setRecordFilterUsedInAdvancedFilterDropdownRow,
}: UseRuleConditionFilterInitializationProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);
  const [lastInitializedRoleId, setLastInitializedRoleId] =
    useState<string>('');
  const [
    lastInitializedRowLevelPermissionRuleId,
    setLastInitializedRowLevelPermissionRuleId,
  ] = useState<string>('');

  const initialFilters = useMemo(() => {
    const predicates = settingsDraftRole.rowLevelPermissionPredicates ?? [];
    const rulePredicates = predicates.filter(
      (predicate) =>
        predicate.rowLevelPermissionRuleId === rowLevelPermissionRuleId &&
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
    rowLevelPermissionRuleId,
    filterableFieldMetadataItems,
  ]);

  const initialFilterGroups = useMemo(
    () =>
      (settingsDraftRole.rowLevelPermissionPredicateGroups ?? [])
        .filter(
          (group) =>
            group.rowLevelPermissionRuleId === rowLevelPermissionRuleId,
        )
        .map(convertPredicateGroupToRecordFilterGroup),
    [
      settingsDraftRole.rowLevelPermissionPredicateGroups,
      rowLevelPermissionRuleId,
    ],
  );

  useEffect(() => {
    const isRoleOrRuleChanged =
      lastInitializedRoleId !== roleId ||
      lastInitializedRowLevelPermissionRuleId !== rowLevelPermissionRuleId;

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
      setLastInitializedRowLevelPermissionRuleId(rowLevelPermissionRuleId);
    }
  }, [
    roleId,
    rowLevelPermissionRuleId,
    settingsDraftRole.id,
    initialFilters,
    initialFilterGroups,
    hasInitialized,
    lastInitializedRoleId,
    lastInitializedRowLevelPermissionRuleId,
    setCurrentRecordFilters,
    setCurrentRecordFilterGroups,
    setRecordFilterUsedInAdvancedFilterDropdownRow,
  ]);

  return {
    hasInitialized,
  };
};
