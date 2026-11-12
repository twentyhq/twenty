import { type RecordIndexTabItem } from '@/object-record/record-index-tab/types/RecordIndexTabItem';
import { isDefined } from 'twenty-shared/utils';

type RecordIndexTabCountProps = {
  recordIndexTabItem: RecordIndexTabItem;
};

export const RecordIndexTabCount = ({
  recordIndexTabItem,
}: RecordIndexTabCountProps) =>
  isDefined(recordIndexTabItem.recordCount)
    ? recordIndexTabItem.recordCount
    : '-';
