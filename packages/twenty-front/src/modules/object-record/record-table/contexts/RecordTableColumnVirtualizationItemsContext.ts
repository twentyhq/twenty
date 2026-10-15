import { type RecordTableColumnVirtualizationItem } from '@/object-record/record-table/virtualization/types/RecordTableColumnVirtualizationItem';
import { createRequiredContext } from '~/utils/createRequiredContext';

export const [
  RecordTableColumnVirtualizationItemsContextValueProvider,
  useRecordTableColumnVirtualizationItemsContextOrThrow,
] = createRequiredContext<RecordTableColumnVirtualizationItem[]>(
  'RecordTableColumnVirtualizationItemsContext',
);
