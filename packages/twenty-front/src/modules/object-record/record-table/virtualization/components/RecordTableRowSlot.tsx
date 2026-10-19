import { isDefined } from 'twenty-shared/utils';

import { RecordTableRowSlotPosition } from '@/object-record/record-table/virtualization/components/RecordTableRowSlotPosition';
import { RecordTableRowSlotRecord } from '@/object-record/record-table/virtualization/components/RecordTableRowSlotRecord';
import { RecordTableRowVirtualizedSkeleton } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedSkeleton';
import { rowSlotBindingComponentFamilyState } from '@/object-record/record-table/virtualization/states/rowSlotBindingComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';

type RecordTableRowSlotProps = {
  rowSlot: number;
};

export const RecordTableRowSlot = ({ rowSlot }: RecordTableRowSlotProps) => {
  const rowSlotBinding = useAtomComponentFamilyStateValue(
    rowSlotBindingComponentFamilyState,
    rowSlot,
  );

  if (!isDefined(rowSlotBinding)) {
    return null;
  }

  if (rowSlotBinding.type === 'record') {
    return <RecordTableRowSlotRecord recordId={rowSlotBinding.recordId} />;
  }

  return (
    <RecordTableRowSlotPosition rowIndex={rowSlotBinding.rowIndex}>
      <RecordTableRowVirtualizedSkeleton />
    </RecordTableRowSlotPosition>
  );
};
