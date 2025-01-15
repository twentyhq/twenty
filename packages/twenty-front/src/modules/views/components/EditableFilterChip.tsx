import { useIcons } from 'twenty-ui';

import { getOperandLabelShort } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';

type EditableFilterChipProps = {
  viewFilter: RecordFilter;
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
