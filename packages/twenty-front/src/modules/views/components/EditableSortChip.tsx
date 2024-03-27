import { IconArrowDown, IconArrowUp } from 'twenty-ui';

import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useCombinedViewSorts } from '@/views/hooks/useCombinedViewSorts';

type EditableSortChipProps = {
  viewSort: Sort;
};

export const EditableSortChip = ({ viewSort }: EditableSortChipProps) => {
  const { removeCombinedViewSort, upsertCombinedViewSort } =
    useCombinedViewSorts();

  const handleRemoveClick = () => {
    removeCombinedViewSort(viewSort.fieldMetadataId);
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
