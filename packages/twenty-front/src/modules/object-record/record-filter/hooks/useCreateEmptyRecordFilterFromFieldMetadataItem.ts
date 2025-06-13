import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { getInitialFilterValue } from '@/object-record/object-filter-dropdown/utils/getInitialFilterValue';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getDefaultSubFieldNameForCompositeFilterableFieldType } from '@/object-record/record-filter/utils/getDefaultSubFieldNameForCompositeFilterableFieldType';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { v4 } from 'uuid';

export const useCreateEmptyRecordFilterFromFieldMetadataItem = () => {
  const createEmptyRecordFilterFromFieldMetadataItem = (
    fieldMetadataItem: FieldMetadataItem,
  ) => {
    const filterType = getFilterTypeFromFieldType(fieldMetadataItem.type);

    const availableOperandsForFilter = getRecordFilterOperands({
      filterType,
    });

    const defaultOperand = availableOperandsForFilter[0];

    const defaultSubFieldName =
      getDefaultSubFieldNameForCompositeFilterableFieldType(filterType);

    const { displayValue, value } = getInitialFilterValue(
      filterType,
      defaultOperand,
    );

    const newRecordFilter: RecordFilter = {
      id: v4(),
      fieldMetadataId: fieldMetadataItem.id,
      operand: defaultOperand,
      displayValue,
      label: fieldMetadataItem.label,
      type: filterType,
      value,
      subFieldName: defaultSubFieldName,
    };

    return { newRecordFilter };
  };

  return {
    createEmptyRecordFilterFromFieldMetadataItem,
  };
};
