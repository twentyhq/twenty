import { getOperandLabelShort } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { useLazyLoadIcons } from '@/ui/input/hooks/useLazyLoadIcons';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { ViewFilter } from '@/views/types/ViewFilter';

type EditableFilterChipProps = {
  viewFilter: ViewFilter;
  onRemove: () => void;
};

export const EditableFilterChip = ({
  viewFilter,
  onRemove,
}: EditableFilterChipProps) => {
  const { icons } = useLazyLoadIcons();
  return (
    <SortOrFilterChip
      key={viewFilter.fieldMetadataId}
      testId={viewFilter.fieldMetadataId}
      labelKey={viewFilter.definition.label}
      labelValue={`${getOperandLabelShort(viewFilter.operand)} ${
        viewFilter.displayValue
      }`}
      Icon={icons[viewFilter.definition.iconName]}
      onRemove={onRemove}
    />
  );
};
