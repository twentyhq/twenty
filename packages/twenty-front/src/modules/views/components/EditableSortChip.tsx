import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useRemoveRecordSort } from '@/object-record/record-sort/hooks/useRemoveRecordSort';
import { useUpsertRecordSort } from '@/object-record/record-sort/hooks/useUpsertRecordSort';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { IconArrowDown, IconArrowUp } from 'twenty-ui/display';

type EditableSortChipProps = {
  recordSort: RecordSort;
};

export const EditableSortChip = ({ recordSort }: EditableSortChipProps) => {
  const { removeRecordSort } = useRemoveRecordSort();

  const { upsertRecordSort } = useUpsertRecordSort();

  const handleRemoveClick = () => {
    removeRecordSort(recordSort.fieldMetadataId);
  };

  const { fieldMetadataItem } = useFieldMetadataItemById(
    recordSort.fieldMetadataId,
  );

  const handleClick = () => {
    const newSort: RecordSort = {
      ...recordSort,
      direction: recordSort.direction === 'asc' ? 'desc' : 'asc',
    };

    upsertRecordSort(newSort);
  };

  return (
    <SortOrFilterChip
      key={recordSort.fieldMetadataId}
      testId={recordSort.fieldMetadataId}
      labelValue={fieldMetadataItem.label}
      Icon={recordSort.direction === 'desc' ? IconArrowDown : IconArrowUp}
      onRemove={handleRemoveClick}
      onClick={handleClick}
      type="sort"
    />
  );
};
