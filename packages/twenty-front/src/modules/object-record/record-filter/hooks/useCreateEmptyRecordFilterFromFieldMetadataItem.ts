import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useGetInitialFilterValue } from '@/object-record/object-filter-dropdown/hooks/useGetInitialFilterValue';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getDefaultSubFieldNameForCompositeFilterableFieldType } from '@/object-record/record-filter/utils/getDefaultSubFieldNameForCompositeFilterableFieldType';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { getFilterTypeFromFieldType } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const useCreateEmptyRecordFilterFromFieldMetadataItem = () => {
  const { getInitialFilterValue } = useGetInitialFilterValue();

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
