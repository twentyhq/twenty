import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { getOperandLabelShort } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { isCompositeField } from '@/object-record/object-filter-dropdown/utils/isCompositeField';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isValidSubFieldName } from '@/settings/data-model/utils/isValidSubFieldName';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { isNonEmptyString } from '@sniptt/guards';
import { useIcons } from 'twenty-ui/display';

type EditableFilterChipProps = {
  recordFilter: RecordFilter;
  onRemove: () => void;
};

export const EditableFilterChip = ({
  recordFilter,
  onRemove,
}: EditableFilterChipProps) => {
  const { getIcon } = useIcons();

  const { fieldMetadataItem } = useFieldMetadataItemById(
    recordFilter.fieldMetadataId,
  );

  const FieldMetadataItemIcon = getIcon(fieldMetadataItem.icon);

  const operandLabelShort = getOperandLabelShort(recordFilter.operand);

  const recordFilterSubFieldName = recordFilter.subFieldName;

  const subFieldLabel =
    isCompositeField(fieldMetadataItem.type) &&
    isNonEmptyString(recordFilterSubFieldName) &&
    isValidSubFieldName(recordFilterSubFieldName)
      ? getCompositeSubFieldLabel(
          fieldMetadataItem.type,
          recordFilterSubFieldName,
        )
      : '';

  const fieldNameLabel = isNonEmptyString(subFieldLabel)
    ? `${recordFilter.label} / ${subFieldLabel}`
    : recordFilter.label;

  const labelKey = `${fieldNameLabel}${isNonEmptyString(recordFilter.value) ? operandLabelShort : ''}`;

  return (
    <SortOrFilterChip
      key={recordFilter.id}
      testId={recordFilter.id}
      labelKey={labelKey}
      labelValue={recordFilter.displayValue}
      Icon={FieldMetadataItemIcon}
      onRemove={onRemove}
    />
  );
};
