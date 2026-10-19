import { isDefined } from 'twenty-shared/utils';

import { recordTableRowIndexOfRecordComponentFamilySelector } from '@/object-record/record-table/states/selectors/recordTableRowIndexOfRecordComponentFamilySelector';
import { RecordTableRowSlotPosition } from '@/object-record/record-table/virtualization/components/RecordTableRowSlotPosition';
import { RecordTableRowSlotRecordContent } from '@/object-record/record-table/virtualization/components/RecordTableRowSlotRecordContent';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';

type RecordTableRowSlotRecordProps = {
  recordId: string;
};

export const RecordTableRowSlotRecord = ({
  recordId,
}: RecordTableRowSlotRecordProps) => {
  const rowIndex = useAtomComponentFamilySelectorValue(
    recordTableRowIndexOfRecordComponentFamilySelector,
    recordId,
  );

  if (!isDefined(rowIndex)) {
    return null;
  }

  return (
    <RecordTableRowSlotPosition rowIndex={rowIndex}>
      <RecordTableRowSlotRecordContent recordId={recordId} />
    </RecordTableRowSlotPosition>
  );
};
