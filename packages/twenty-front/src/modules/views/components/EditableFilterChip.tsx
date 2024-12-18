import { useIcons } from 'twenty-ui';

import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { getOperandLabelShort } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
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
      key={viewFilter.id}
      testId={viewFilter.id}
      labelKey={`${viewFilter.definition.label}${getOperandLabelShort(viewFilter.operand)}`}
      labelValue={viewFilter.displayValue}
      Icon={getIcon(viewFilter.definition.iconName)}
      onRemove={onRemove}
    />
  );
};
