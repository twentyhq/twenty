import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import { IconFilter, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { v4 } from 'uuid';

import { ActionButton } from '@/action-menu/actions/display/components/ActionButton';
import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AdvancedFilterCommandMenuColumn } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuColumn';
import { AdvancedFilterCommandMenuLogicalOperatorCell } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuLogicalOperatorCell';
import { AdvancedFilterCommandMenuRecordFilterOperandSelect } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuRecordFilterOperandSelect';
import { AdvancedFilterRecordFilterOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOptionsDropdown';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { useGetDefaultFieldMetadataItemForFilter } from '@/object-record/advanced-filter/hooks/useGetDefaultFieldMetadataItemForFilter';
import { useSetRecordFilterUsedInAdvancedFilterDropdownRow } from '@/object-record/advanced-filter/hooks/useSetRecordFilterUsedInAdvancedFilterDropdownRow';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { isRecordFilterGroupChildARecordFilterGroup } from '@/object-record/advanced-filter/utils/isRecordFilterGroupChildARecordFilterGroup';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { useUpsertRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useUpsertRecordFilterGroup';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getDefaultSubFieldNameForCompositeFilterableFieldType } from '@/object-record/record-filter/utils/getDefaultSubFieldNameForCompositeFilterableFieldType';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { RLSFieldSelect } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/RLSFieldSelect';
import { RLSValueInput } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/RLSValueInput';
import {
  convertPredicateGroupToRecordFilterGroup,
  convertPredicateToRecordFilter,
  convertRecordFilterGroupToPredicateGroup,
  convertRecordFilterToPredicate,
} from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/rlsPredicateConversion';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

const StyledContainer = styled.div`
  align-items: start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  width: 100%;
`;

const StyledRowContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

type RLSFilterBuilderProps = {
  roleId: string;
  objectMetadataItem: ObjectMetadataItem;
};

const RLSFilterBuilderContent = ({
  roleId,
  objectMetadataItem,
}: RLSFilterBuilderProps) => {
  const hasInitializedRef = useRef(false);

  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );
  const setSettingsDraftRole = useSetRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const { filterableFieldMetadataItems } = useFilterableFieldMetadataItems(
    objectMetadataItem.id,
  );

  const setCurrentRecordFilters = useSetRecoilComponentState(
    currentRecordFiltersComponentState,
  );

  const setCurrentRecordFilterGroups = useSetRecoilComponentState(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const currentRecordFilterGroups = useRecoilComponentValue(
    currentRecordFilterGroupsComponentState,
  );

  const { setRecordFilterUsedInAdvancedFilterDropdownRow } =
    useSetRecordFilterUsedInAdvancedFilterDropdownRow();

  const rootRecordFilterGroup = useRecoilComponentValue(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const { childRecordFiltersAndRecordFilterGroups } =
    useChildRecordFiltersAndRecordFilterGroups({
      recordFilterGroupId: rootRecordFilterGroup?.id,
    });

  // Convert predicates for the current object to RecordFilters
  const initialFilters = useMemo(() => {
    const predicates = settingsDraftRole.rowLevelPermissionPredicates ?? [];
    const objectPredicates = predicates.filter(
      (p) => p.objectMetadataId === objectMetadataItem.id,
    );

    return objectPredicates
      .map((predicate) => {
        const fieldMetadataItem = filterableFieldMetadataItems.find(
          (f) => f.id === predicate.fieldMetadataId,
        );
        return convertPredicateToRecordFilter(predicate, fieldMetadataItem);
      })
      .filter(isDefined);
  }, [
    settingsDraftRole.rowLevelPermissionPredicates,
    objectMetadataItem.id,
    filterableFieldMetadataItems,
  ]);

  // Convert predicate groups for the current role to RecordFilterGroups
  const initialFilterGroups = useMemo(() => {
    const predicateGroups =
      settingsDraftRole.rowLevelPermissionPredicateGroups ?? [];

    const objectPredicateGroupIds = new Set(
      (settingsDraftRole.rowLevelPermissionPredicates ?? [])
        .filter((p) => p.objectMetadataId === objectMetadataItem.id)
        .map((p) => p.rowLevelPermissionPredicateGroupId)
        .filter(isDefined),
    );

    const relevantGroups = predicateGroups.filter(
      (g) =>
        objectPredicateGroupIds.has(g.id) ||
        (isDefined(g.parentRowLevelPermissionPredicateGroupId) &&
          objectPredicateGroupIds.has(
            g.parentRowLevelPermissionPredicateGroupId,
          )),
    );

    const rootGroups = predicateGroups.filter(
      (g) =>
        !g.parentRowLevelPermissionPredicateGroupId &&
        relevantGroups.some(
          (rg) =>
            rg.id === g.id ||
            rg.parentRowLevelPermissionPredicateGroupId === g.id,
        ),
    );

    const allRelevantGroups = [...new Set([...rootGroups, ...relevantGroups])];

    return allRelevantGroups.map(convertPredicateGroupToRecordFilterGroup);
  }, [
    settingsDraftRole.rowLevelPermissionPredicateGroups,
    settingsDraftRole.rowLevelPermissionPredicates,
    objectMetadataItem.id,
  ]);

  // Initialize state on mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      setCurrentRecordFilters(initialFilters);
      setCurrentRecordFilterGroups(initialFilterGroups);

      for (const filter of initialFilters) {
        setRecordFilterUsedInAdvancedFilterDropdownRow(filter);
      }

      hasInitializedRef.current = true;
    }
  }, [
    initialFilters,
    initialFilterGroups,
    setCurrentRecordFilters,
    setCurrentRecordFilterGroups,
    setRecordFilterUsedInAdvancedFilterDropdownRow,
  ]);

  // Sync changes back to draft role
  const syncToDraftRole = useCallback(() => {
    setSettingsDraftRole((prev) => {
      const otherObjectPredicates = (
        prev.rowLevelPermissionPredicates ?? []
      ).filter((p) => p.objectMetadataId !== objectMetadataItem.id);

      const currentObjectGroupIds = new Set(
        currentRecordFilters
          .map((f) => f.recordFilterGroupId)
          .filter(isDefined),
      );

      const currentObjectRootGroupIds = new Set(
        currentRecordFilterGroups
          .filter((g) => !g.parentRecordFilterGroupId)
          .map((g) => g.id),
      );

      const otherObjectGroups = (
        prev.rowLevelPermissionPredicateGroups ?? []
      ).filter(
        (g) =>
          !currentObjectGroupIds.has(g.id) &&
          !currentObjectRootGroupIds.has(g.id),
      );

      const newPredicates = currentRecordFilters.map((filter) =>
        convertRecordFilterToPredicate(filter, roleId, objectMetadataItem.id),
      );

      const newPredicateGroups = currentRecordFilterGroups.map((group) =>
        convertRecordFilterGroupToPredicateGroup(group, roleId),
      );

      return {
        ...prev,
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

  // Auto-sync when filter state changes (but not during initialization)
  useEffect(() => {
    if (hasInitializedRef.current) {
      syncToDraftRole();
    }
  }, [syncToDraftRole]);

  // Hooks for adding filters
  const { upsertRecordFilter } = useUpsertRecordFilter();
  const { upsertRecordFilterGroup } = useUpsertRecordFilterGroup();
  const { createEmptyRecordFilterFromFieldMetadataItem } =
    useCreateEmptyRecordFilterFromFieldMetadataItem();
  const { getDefaultFieldMetadataItemForFilter } =
    useGetDefaultFieldMetadataItemForFilter();

  const availableFieldMetadataItemsForFilter = useRecoilValue(
    availableFieldMetadataItemsForFilterFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const defaultFieldMetadataItem =
    availableFieldMetadataItemsForFilter.find(
      (fieldMetadataItem) =>
        fieldMetadataItem.id ===
        objectMetadataItem?.labelIdentifierFieldMetadataId,
    ) ?? availableFieldMetadataItemsForFilter[0];

  const { lastChildPosition } = useChildRecordFiltersAndRecordFilterGroups({
    recordFilterGroupId: rootRecordFilterGroup?.id,
  });

  const handleCreateFirstFilter = () => {
    if (isDefined(rootRecordFilterGroup)) {
      return;
    }

    const newRecordFilterGroup = {
      id: v4(),
      logicalOperator: RecordFilterGroupLogicalOperator.AND,
    };

    upsertRecordFilterGroup(newRecordFilterGroup);

    if (!isDefined(defaultFieldMetadataItem)) {
      throw new Error('Missing default filter definition');
    }

    const { newRecordFilter } = createEmptyRecordFilterFromFieldMetadataItem(
      defaultFieldMetadataItem,
    );

    newRecordFilter.recordFilterGroupId = newRecordFilterGroup.id;

    upsertRecordFilter(newRecordFilter);
    setRecordFilterUsedInAdvancedFilterDropdownRow(newRecordFilter);
  };

  const handleAddFilter = (recordFilterGroup: RecordFilterGroup) => {
    const { defaultFieldMetadataItemForFilter } =
      getDefaultFieldMetadataItemForFilter(objectMetadataItem);

    if (!isDefined(defaultFieldMetadataItemForFilter)) {
      throw new Error('Missing default field metadata item for filter');
    }

    const filterType = getFilterTypeFromFieldType(
      defaultFieldMetadataItemForFilter.type,
    );

    const defaultSubFieldName =
      getDefaultSubFieldNameForCompositeFilterableFieldType(filterType);

    const newRecordFilter: RecordFilter = {
      id: v4(),
      fieldMetadataId: defaultFieldMetadataItemForFilter.id,
      type: filterType,
      operand: getRecordFilterOperands({ filterType })[0],
      value: '',
      displayValue: '',
      recordFilterGroupId: recordFilterGroup.id,
      positionInRecordFilterGroup: lastChildPosition + 1,
      label: defaultFieldMetadataItemForFilter.label,
      subFieldName: defaultSubFieldName,
    };

    upsertRecordFilter(newRecordFilter);
    setRecordFilterUsedInAdvancedFilterDropdownRow(newRecordFilter);
  };

  // Render filter row inline
  const renderFilterRow = (
    recordFilter: RecordFilter,
    index: number,
    recordFilterGroup: RecordFilterGroup,
  ) => (
    <ObjectFilterDropdownComponentInstanceContext.Provider
      key={recordFilter.id}
      value={{
        instanceId: getAdvancedFilterObjectFilterDropdownComponentInstanceId(
          recordFilter.id,
        ),
      }}
    >
      <AdvancedFilterCommandMenuColumn>
        <StyledRowContainer>
          <AdvancedFilterCommandMenuLogicalOperatorCell
            index={index}
            recordFilterGroup={recordFilterGroup}
          />
          <AdvancedFilterRecordFilterOptionsDropdown
            recordFilterId={recordFilter.id}
          />
        </StyledRowContainer>
        <RLSFieldSelect recordFilterId={recordFilter.id} />
        <AdvancedFilterCommandMenuRecordFilterOperandSelect
          recordFilterId={recordFilter.id}
        />
        <RLSValueInput recordFilterId={recordFilter.id} />
      </AdvancedFilterCommandMenuColumn>
    </ObjectFilterDropdownComponentInstanceContext.Provider>
  );

  return (
    <AdvancedFilterContext.Provider value={{ objectMetadataItem }}>
      {isDefined(rootRecordFilterGroup) ? (
        <StyledContainer>
          <StyledFiltersContainer>
            {childRecordFiltersAndRecordFilterGroups.map(
              (child, index) =>
                !isRecordFilterGroupChildARecordFilterGroup(child) &&
                renderFilterRow(child, index, rootRecordFilterGroup),
            )}
          </StyledFiltersContainer>
          <ActionButton
            action={{
              Icon: IconPlus,
              label: t`Add rule`,
              shortLabel: t`Add rule`,
              key: 'add-rule',
            }}
            onClick={() => handleAddFilter(rootRecordFilterGroup)}
          />
        </StyledContainer>
      ) : (
        <Button
          Icon={IconFilter}
          size="small"
          variant="secondary"
          accent="default"
          onClick={handleCreateFirstFilter}
          ariaLabel={t`Add filter`}
          title={t`Add filter`}
        />
      )}
    </AdvancedFilterContext.Provider>
  );
};

export const RLSFilterBuilder = ({
  roleId,
  objectMetadataItem,
}: RLSFilterBuilderProps) => {
  const instanceId = `rls-filter-${roleId}-${objectMetadataItem.id}`;

  return (
    <RecordFilterGroupsComponentInstanceContext.Provider value={{ instanceId }}>
      <RecordFiltersComponentInstanceContext.Provider value={{ instanceId }}>
        <RLSFilterBuilderContent
          roleId={roleId}
          objectMetadataItem={objectMetadataItem}
        />
      </RecordFiltersComponentInstanceContext.Provider>
    </RecordFilterGroupsComponentInstanceContext.Provider>
  );
};

