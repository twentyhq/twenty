import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { getOperandLabelShort } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { isNonEmptyString } from '@sniptt/guards';
import { useIcons } from 'twenty-ui/display';

type EditableFilterChipProps = {
  viewFilter: RecordFilter;
  onRemove: () => void;
};

export const EditableFilterChip = ({
  viewFilter,
  onRemove,
}: EditableFilterChipProps) => {
  const { getIcon } = useIcons();

  const { fieldMetadataItem } = useFieldMetadataItemById(
    viewFilter.fieldMetadataId,
  );

  const FieldMetadataItemIcon = getIcon(fieldMetadataItem.icon);

  const operandLabelShort = getOperandLabelShort(viewFilter.operand);

  const labelKey = `${viewFilter.label}${isNonEmptyString(viewFilter.value) ? operandLabelShort : ''}`;

  return (
    <SortOrFilterChip
      key={viewFilter.id}
      testId={viewFilter.id}
      labelKey={labelKey}
      labelValue={viewFilter.displayValue}
      Icon={FieldMetadataItemIcon}
      onRemove={onRemove}
    />
  );
};
