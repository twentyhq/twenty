import { getOperandLabelShort } from "@/object-record/object-filter-dropdown/utils/getOperandLabel";
import { useLazyLoadIcons } from "@/ui/input/hooks/useLazyLoadIcons";
import { SortOrFilterChip } from "@/views/components/SortOrFilterChip";
import { useViewBar } from "@/views/hooks/useViewBar";
import { ViewFilter } from "@/views/types/ViewFilter";
import { ViewSort } from "@/views/types/ViewSort";
import { IconArrowDown, IconArrowUp } from '@/ui/display/icon/index';

type EditableSortChipProps = { 
  viewSort: ViewSort
}

export const EditableSortChip = ({
  viewSort
}: EditableSortChipProps) => {
  const { icons } = useLazyLoadIcons();
  const { removeViewSort, upsertViewSort } = useViewBar();

  const handleRemoveClick = () => {
    removeViewSort(viewSort.fieldMetadataId);
  }

  const handleClick = () => {
    upsertViewSort({
      ...viewSort,
      direction: viewSort.direction === 'asc' ? 'desc' : 'asc',
    })
  }


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
  )
}
  