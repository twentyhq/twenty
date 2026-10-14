import { getTraversedFieldLabel } from '@/object-record/record-field/utils/getTraversedFieldLabel';
import { isDefined } from 'twenty-shared/utils';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useGetInitialFilterValue } from '@/object-record/object-filter-dropdown/hooks/useGetInitialFilterValue';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getDefaultSubFieldNameForCompositeFilterableFieldType } from '@/object-record/record-filter/utils/getDefaultSubFieldNameForCompositeFilterableFieldType';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { getFilterTypeFromFieldType } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const useCreateEmptyRecordFilterFromFieldMetadataItem = () => {
  const { getInitialFilterValue } = useGetInitialFilterValue();

  // With a relation target, the filter is created on the relation field but
  // its type, operands and value come from the target field of the related object.
  const createEmptyRecordFilterFromFieldMetadataItem = (
    fieldMetadataItem: FieldMetadataItem,
    relationTargetFieldMetadataItem?: FieldMetadataItem,
  ) => {
    const filteredFieldMetadataItem =
      relationTargetFieldMetadataItem ?? fieldMetadataItem;

    const filterType = getFilterTypeFromFieldType(
      filteredFieldMetadataItem.type,
    );

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
      label: isDefined(relationTargetFieldMetadataItem)
        ? getTraversedFieldLabel({
            relationFieldLabel: fieldMetadataItem.label,
            targetFieldLabel: relationTargetFieldMetadataItem.label,
          })
        : fieldMetadataItem.label,
      type: filterType,
      value,
      subFieldName: defaultSubFieldName,
      relationTargetFieldMetadataId: relationTargetFieldMetadataItem?.id ?? null,
    };

    return { newRecordFilter };
  };

  return {
    createEmptyRecordFilterFromFieldMetadataItem,
  };
};
