import { IconArrowDown, IconArrowUp } from 'twenty-ui';

import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useDeleteCombinedViewSorts } from '@/views/hooks/useDeleteCombinedViewSorts';
import { useUpsertCombinedViewSorts } from '@/views/hooks/useUpsertCombinedViewSorts';

type EditableSortChipProps = {
  viewSort: Sort;
};

export const EditableSortChip = ({ viewSort }: EditableSortChipProps) => {
  const { deleteCombinedViewSort } = useDeleteCombinedViewSorts();

  const { upsertCombinedViewSort } = useUpsertCombinedViewSorts();

  const handleRemoveClick = () => {
    deleteCombinedViewSort(viewSort.fieldMetadataId);
  };

  const handleClick = () => {
    upsertCombinedViewSort({
      ...viewSort,
      direction: viewSort.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <SortOrFilterChip
      key={viewSort.fieldMetadataId}
      testId={viewSort.fieldMetadataId}
      labelValue={viewSort.definition.label}
      Icon={viewSort.direction === 'desc' ? IconArrowDown : IconArrowUp}
      onRemove={handleRemoveClick}
      onClick={handleClick}
    />
  );
};
