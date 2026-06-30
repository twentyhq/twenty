import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { RecordTableRecordGroupBodyEffect } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupBodyEffect';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordTableRecordGroupBodyEffects = () => {
  const recordGroupIds = useAtomComponentStateValue(
    recordGroupIdsComponentState,
  );

  return recordGroupIds.map((recordGroupId) => (
    <RecordGroupContext.Provider key={recordGroupId} value={{ recordGroupId }}>
      <RecordTableRecordGroupBodyEffect />
    </RecordGroupContext.Provider>
  ));
};
