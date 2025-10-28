import { useFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useFieldMetadataItemByIdOrThrow';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useComputeRecordRelationFilterLabelValue } from '@/views/hooks/useComputeRecordRelationFilterLabelValue';
import { useIcons } from 'twenty-ui/display';

type EditableRelationFilterChipProps = {
  recordFilter: RecordFilter;
  onRemove: () => void;
  onClick?: () => void;
};

export const EditableRelationFilterChip = ({
  recordFilter,
  onRemove,
  onClick,
}: EditableRelationFilterChipProps) => {
  const { getIcon } = useIcons();

  const { fieldMetadataItem } = useFieldMetadataItemByIdOrThrow(
    recordFilter.fieldMetadataId,
  );

  const FieldMetadataItemIcon = getIcon(fieldMetadataItem.icon);

  const { labelValue } = useComputeRecordRelationFilterLabelValue({
    recordFilter,
  });

  return (
    <SortOrFilterChip
      key={recordFilter.id}
      testId={recordFilter.id}
      labelKey={fieldMetadataItem.label}
      labelValue={labelValue}
      Icon={FieldMetadataItemIcon}
      onRemove={onRemove}
      onClick={onClick}
      type="filter"
    />
  );
};
