import { type RecordIndexTabItem } from '@/object-record/record-index-tab/types/RecordIndexTabItem';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';

type RecordIndexTabChipProps = {
  recordIndexTabItem: RecordIndexTabItem;
};

export const RecordIndexTabChip = ({
  recordIndexTabItem,
}: RecordIndexTabChipProps) => {
  const hasColor = isDefined(recordIndexTabItem.color);

  return (
    <Tag
      variant={hasColor ? 'soft' : 'outline'}
      borderStyle="dashed"
      color={recordIndexTabItem.color ?? 'transparent'}
      weight="medium"
    >
      {recordIndexTabItem.label}
    </Tag>
  );
};
