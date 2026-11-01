import { isDefined } from 'twenty-shared/utils';

import { RecordTableRowSlotContainer } from '@/object-record/record-table/virtualization/components/RecordTableRowSlotContainer';
import { RecordTableRowSlotRecord } from '@/object-record/record-table/virtualization/components/RecordTableRowSlotRecord';
import { RecordTableRowVirtualizedSkeleton } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedSkeleton';
import { getRowSlotTop } from '@/object-record/record-table/virtualization/utils/getRowSlotTop';
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
    <RecordTableRowSlotContainer
      style={{ top: getRowSlotTop(rowSlotBinding.rowIndex) }}
    >
      <RecordTableRowVirtualizedSkeleton />
    </RecordTableRowSlotContainer>
  );
};
