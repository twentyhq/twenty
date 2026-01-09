import { useRecoilValue } from 'recoil';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { useGetDefaultFieldMetadataItemForFilter } from '@/object-record/advanced-filter/hooks/useGetDefaultFieldMetadataItemForFilter';
import { useSetRecordFilterUsedInAdvancedFilterDropdownRow } from '@/object-record/advanced-filter/hooks/useSetRecordFilterUsedInAdvancedFilterDropdownRow';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { useUpsertRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useUpsertRecordFilterGroup';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getDefaultSubFieldNameForCompositeFilterableFieldType } from '@/object-record/record-filter/utils/getDefaultSubFieldNameForCompositeFilterableFieldType';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

type UseRecordLevelPermissionFilterActionsProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const useRecordLevelPermissionFilterActions = ({
  objectMetadataItem,
}: UseRecordLevelPermissionFilterActionsProps) => {
  const { upsertRecordFilter } = useUpsertRecordFilter();
  const { upsertRecordFilterGroup } = useUpsertRecordFilterGroup();
  const { createEmptyRecordFilterFromFieldMetadataItem } =
    useCreateEmptyRecordFilterFromFieldMetadataItem();
  const { getDefaultFieldMetadataItemForFilter } =
    useGetDefaultFieldMetadataItemForFilter();
  const { setRecordFilterUsedInAdvancedFilterDropdownRow } =
    useSetRecordFilterUsedInAdvancedFilterDropdownRow();

  const availableFieldMetadataItemsForFilter = useRecoilValue(
    availableFieldMetadataItemsForFilterFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const rootRecordFilterGroup = useRecoilComponentValue(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const { lastChildPosition } = useChildRecordFiltersAndRecordFilterGroups({
    recordFilterGroupId: rootRecordFilterGroup?.id,
  });

  const getDefaultFieldMetadataItemForRLS = () => {
    const fieldMetadataItemForId = availableFieldMetadataItemsForFilter.find(
      (fieldMetadataItem) => fieldMetadataItem.name === 'id',
    );

    if (isDefined(fieldMetadataItemForId)) {
      return fieldMetadataItemForId;
    }

    const { defaultFieldMetadataItemForFilter } =
      getDefaultFieldMetadataItemForFilter(objectMetadataItem);

    return defaultFieldMetadataItemForFilter;
  };

  const handleCreateFirstFilter = () => {
    if (isDefined(rootRecordFilterGroup)) {
      return;
    }

    const newRecordFilterGroup = {
      id: v4(),
      logicalOperator: RecordFilterGroupLogicalOperator.AND,
    };

    upsertRecordFilterGroup(newRecordFilterGroup);

    const defaultFieldMetadataItemForRLS = getDefaultFieldMetadataItemForRLS();

    if (!isDefined(defaultFieldMetadataItemForRLS)) {
      throw new Error('Missing default filter definition');
    }

    const { newRecordFilter } = createEmptyRecordFilterFromFieldMetadataItem(
      defaultFieldMetadataItemForRLS,
    );

    newRecordFilter.recordFilterGroupId = newRecordFilterGroup.id;

    upsertRecordFilter(newRecordFilter);
    setRecordFilterUsedInAdvancedFilterDropdownRow(newRecordFilter);
  };

  const handleAddFilter = (recordFilterGroup: RecordFilterGroup) => {
    const defaultFieldMetadataItemForRLS = getDefaultFieldMetadataItemForRLS();

    if (!isDefined(defaultFieldMetadataItemForRLS)) {
      throw new Error('Missing default field metadata item for filter');
    }

    const filterType = getFilterTypeFromFieldType(
      defaultFieldMetadataItemForRLS.type,
    );

    const defaultSubFieldName =
      getDefaultSubFieldNameForCompositeFilterableFieldType(filterType);

    const newRecordFilter: RecordFilter = {
      id: v4(),
      fieldMetadataId: defaultFieldMetadataItemForRLS.id,
      type: filterType,
      operand: getRecordFilterOperands({ filterType })[0],
      value: '',
      displayValue: '',
      recordFilterGroupId: recordFilterGroup.id,
      positionInRecordFilterGroup: lastChildPosition + 1,
      label: defaultFieldMetadataItemForRLS.label,
      subFieldName: defaultSubFieldName,
    };

    upsertRecordFilter(newRecordFilter);
    setRecordFilterUsedInAdvancedFilterDropdownRow(newRecordFilter);
  };

  return {
    handleCreateFirstFilter,
    handleAddFilter,
  };
};
