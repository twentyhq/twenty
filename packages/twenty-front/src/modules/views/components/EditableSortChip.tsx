import { IconArrowDown, IconArrowUp } from '@/ui/display/icon/index';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useViewBar } from '@/views/hooks/useViewBar';
import { ViewSort } from '@/views/types/ViewSort';

type EditableSortChipProps = {
  viewSort: ViewSort;
};

export const EditableSortChip = ({ viewSort }: EditableSortChipProps) => {
  const { removeViewSort, upsertViewSort } = useViewBar();

  const handleRemoveClick = () => {
    removeViewSort(viewSort.fieldMetadataId);
  };

  const handleClick = () => {
    upsertViewSort({
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
      isSort
      onRemove={handleRemoveClick}
      onClick={handleClick}
    />
  );
};
