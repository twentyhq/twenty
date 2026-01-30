import { useFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useFieldMetadataItemByIdOrThrow';
import { useRemoveRecordSort } from '@/object-record/record-sort/hooks/useRemoveRecordSort';
import { useUpsertRecordSort } from '@/object-record/record-sort/hooks/useUpsertRecordSort';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { IconArrowDown, IconArrowUp } from 'twenty-ui/display';
import { ViewSortDirection } from '~/generated/graphql';

type EditableSortChipProps = {
  recordSort: RecordSort;
};

export const EditableSortChip = ({ recordSort }: EditableSortChipProps) => {
  const { removeRecordSort } = useRemoveRecordSort();

  const { upsertRecordSort } = useUpsertRecordSort();

  const handleRemoveClick = () => {
    removeRecordSort(recordSort.fieldMetadataId);
  };

  const { fieldMetadataItem } = useFieldMetadataItemByIdOrThrow(
    recordSort.fieldMetadataId,
  );

  const handleClick = () => {
    const newSort: RecordSort = {
      ...recordSort,
      direction:
        recordSort.direction === ViewSortDirection.ASC
          ? ViewSortDirection.DESC
          : ViewSortDirection.ASC,
    };
    upsertRecordSort(newSort);
  };

  return (
    <SortOrFilterChip
      key={recordSort.fieldMetadataId}
      testId={recordSort.fieldMetadataId}
      labelValue={fieldMetadataItem.label}
      Icon={
        recordSort.direction === ViewSortDirection.DESC
          ? IconArrowDown
          : IconArrowUp
      }
      onRemove={handleRemoveClick}
      onClick={handleClick}
      type="sort"
    />
  );
};
