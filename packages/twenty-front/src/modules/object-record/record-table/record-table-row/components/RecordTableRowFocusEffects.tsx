import { isDefined } from 'twenty-shared/utils';

import { RecordTableRowArrowKeysEffect } from '@/object-record/record-table/record-table-row/components/RecordTableRowArrowKeysEffect';
import { RecordTableRowHotkeyEffect } from '@/object-record/record-table/record-table-row/components/RecordTableRowHotkeyEffect';
import { useRecordTableRowFocusId } from '@/object-record/record-table/record-table-row/hooks/useRecordTableRowFocusId';

export const RecordTableRowFocusEffects = () => {
  const focusId = useRecordTableRowFocusId();

  if (!isDefined(focusId)) {
    return null;
  }

  return (
    <>
      <RecordTableRowHotkeyEffect focusId={focusId} />
      <RecordTableRowArrowKeysEffect focusId={focusId} />
    </>
  );
};
