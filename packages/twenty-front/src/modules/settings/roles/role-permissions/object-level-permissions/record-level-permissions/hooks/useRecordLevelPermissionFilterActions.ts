/* @license Enterprise */

import { useRecoilValue } from 'recoil';
import {
  FieldMetadataType,
  RecordFilterGroupLogicalOperator,
} from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { useGetDefaultFieldMetadataItemForFilter } from '@/object-record/advanced-filter/hooks/useGetDefaultFieldMetadataItemForFilter';
import { useSetRecordFilterUsedInAdvancedFilterDropdownRow } from '@/object-record/advanced-filter/hooks/useSetRecordFilterUsedInAdvancedFilterDropdownRow';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { useUpsertRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useUpsertRecordFilterGroup';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getDefaultSubFieldNameForCompositeFilterableFieldType } from '@/object-record/record-filter/utils/getDefaultSubFieldNameForCompositeFilterableFieldType';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { RECORD_LEVEL_PERMISSION_PREDICATE_FIELD_TYPES } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/constants/RecordLevelPermissionPredicateFieldTypes';
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
    const availableFieldMetadataItemsForRls =
      availableFieldMetadataItemsForFilter.filter((fieldMetadataItem) => {
        return (
          RECORD_LEVEL_PERMISSION_PREDICATE_FIELD_TYPES.includes(
            fieldMetadataItem.type,
          ) ||
          (fieldMetadataItem.type === FieldMetadataType.RELATION &&
            fieldMetadataItem.relation?.targetObjectMetadata.nameSingular ===
              CoreObjectNameSingular.WorkspaceMember)
        );
      });

    const nonCompositeFieldMetadataItems = availableFieldMetadataItemsForRls
      .toSorted((firstField, secondField) =>
        firstField.label.localeCompare(secondField.label),
      )
      .filter((fieldMetadataItem) => {
        const filterType = getFilterTypeFromFieldType(fieldMetadataItem.type);

        return !isCompositeFieldType(filterType);
      });

    const defaultFieldMetadataItemForRls =
      nonCompositeFieldMetadataItems.find(
        (fieldMetadataItem) => fieldMetadataItem.name !== 'id',
      ) ?? nonCompositeFieldMetadataItems[0];

    if (isDefined(defaultFieldMetadataItemForRls)) {
      return defaultFieldMetadataItemForRls;
    }

    const fieldMetadataItemForId = availableFieldMetadataItemsForRls.find(
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
