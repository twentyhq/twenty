import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { RecordTableRecordGroupBodyEffect } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupBodyEffect';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordTableRecordGroupBodyEffects = () => {
  const recordGroupIds = useRecoilComponentValueV2(
    recordGroupIdsComponentState,
  );

  return recordGroupIds.map((recordGroupId) => (
    <RecordGroupContext.Provider key={recordGroupId} value={{ recordGroupId }}>
      <RecordTableRecordGroupBodyEffect />
    </RecordGroupContext.Provider>
  ));
};
