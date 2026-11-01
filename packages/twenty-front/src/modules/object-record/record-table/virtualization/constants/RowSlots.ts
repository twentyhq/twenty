import { getContiguousIncrementalValues } from 'twenty-shared/utils';

import { ROW_SLOT_COUNT } from '@/object-record/record-table/virtualization/constants/RowSlotCount';

export const ROW_SLOTS = getContiguousIncrementalValues(ROW_SLOT_COUNT);
