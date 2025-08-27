import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { type FilterableAndTSVectorFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isEmptinessOperand } from '@/object-record/record-filter/utils/isEmptinessOperand';

export const checkIfShouldComputeEmptinessFilter = ({
  recordFilter,
  correspondingFieldMetadataItem,
}: {
  recordFilter: RecordFilter;
  correspondingFieldMetadataItem: Pick<FieldMetadataItem, 'type'>;
}) => {
  const isAnEmptinessOperand = isEmptinessOperand(recordFilter.operand);

  const filterTypesThatHaveNoEmptinessOperand: FilterableAndTSVectorFieldType[] =
    ['BOOLEAN', 'TS_VECTOR'];

  const filterType = getFilterTypeFromFieldType(
    correspondingFieldMetadataItem.type,
  );

  const filterHasEmptinessOperands =
    !filterTypesThatHaveNoEmptinessOperand.includes(filterType);

  const shouldComputeEmptinessFilter =
    filterHasEmptinessOperands && isAnEmptinessOperand;

  return shouldComputeEmptinessFilter;
};
