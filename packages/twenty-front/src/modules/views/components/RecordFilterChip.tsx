import { useIcons } from 'twenty-ui';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';

type RecordFilterChipProps = {
  recordFilter: RecordFilter;
};

export const RecordFilterChip = ({ recordFilter }: RecordFilterChipProps) => {
  const { fieldMetadataItem } = useFieldMetadataItemById(
    recordFilter.fieldMetadataId,
  );

  const { removeRecordFilter } = useRemoveRecordFilter();

  const { getIcon } = useIcons();

  const FieldMetadataItemIcon = getIcon(fieldMetadataItem.icon);

  const handleRemoveClick = () => {
    removeRecordFilter({ recordFilterId: recordFilter.id });
  };

  return (
    <SortOrFilterChip
      testId={recordFilter.fieldMetadataId}
      labelValue={recordFilter.label ?? ''}
      Icon={FieldMetadataItemIcon}
      onRemove={handleRemoveClick}
    />
  );
};
