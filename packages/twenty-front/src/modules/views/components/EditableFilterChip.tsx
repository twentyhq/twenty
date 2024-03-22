import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { getOperandLabelShort } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';

type EditableFilterChipProps = {
  viewFilter: Filter;
  onRemove: () => void;
};

export const EditableFilterChip = ({
  viewFilter,
  onRemove,
}: EditableFilterChipProps) => {
  const { getIcon } = useIcons();
  return (
    <SortOrFilterChip
      key={viewFilter.fieldMetadataId}
      testId={viewFilter.fieldMetadataId}
      labelKey={viewFilter.definition.label}
      labelValue={`${getOperandLabelShort(viewFilter.operand)} ${
        viewFilter.displayValue
      }`}
      Icon={getIcon(viewFilter.definition.iconName)}
      onRemove={onRemove}
    />
  );
};
