import { useIcons } from 'twenty-ui';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { getOperandLabelShort } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';

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

  return (
    <SortOrFilterChip
      key={viewFilter.id}
      testId={viewFilter.id}
      labelKey={`${viewFilter.label}${getOperandLabelShort(viewFilter.operand)}`}
      labelValue={viewFilter.displayValue}
      Icon={FieldMetadataItemIcon}
      onRemove={onRemove}
    />
  );
};
