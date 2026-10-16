import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';

export const RECORD_GROUP_SORT_LABELS: Record<
  RecordGroupSort,
  MessageDescriptor
> = {
  [RecordGroupSort.Manual]: msg`Manual`,
  [RecordGroupSort.Alphabetical]: msg`Alphabetical`,
  [RecordGroupSort.ReverseAlphabetical]: msg`Reverse Alphabetical`,
};
