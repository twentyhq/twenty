import { IconArrowDown, IconArrowUp } from 'twenty-ui';

import { useRemoveRecordSort } from '@/object-record/record-sort/hooks/useRemoveRecordSort';
import { useUpsertRecordSort } from '@/object-record/record-sort/hooks/useUpsertRecordSort';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useDeleteCombinedViewSorts } from '@/views/hooks/useDeleteCombinedViewSorts';
import { useUpsertCombinedViewSorts } from '@/views/hooks/useUpsertCombinedViewSorts';

type EditableSortChipProps = {
  recordSort: RecordSort;
};

export const EditableSortChip = ({ recordSort }: EditableSortChipProps) => {
  const { deleteCombinedViewSort } = useDeleteCombinedViewSorts();

  const { removeRecordSort } = useRemoveRecordSort();

  const { upsertCombinedViewSort } = useUpsertCombinedViewSorts();

  const { upsertRecordSort } = useUpsertRecordSort();

  const handleRemoveClick = () => {
    deleteCombinedViewSort(recordSort.fieldMetadataId);
    removeRecordSort(recordSort.fieldMetadataId);
  };

  const handleClick = () => {
    const newSort: RecordSort = {
      ...recordSort,
      direction: recordSort.direction === 'asc' ? 'desc' : 'asc',
    };

    upsertCombinedViewSort(newSort);
    upsertRecordSort(newSort);
  };

  return (
    <SortOrFilterChip
      key={recordSort.fieldMetadataId}
      testId={recordSort.fieldMetadataId}
      labelValue={recordSort.definition.label}
      Icon={recordSort.direction === 'desc' ? IconArrowDown : IconArrowUp}
      onRemove={handleRemoveClick}
      onClick={handleClick}
    />
  );
};
