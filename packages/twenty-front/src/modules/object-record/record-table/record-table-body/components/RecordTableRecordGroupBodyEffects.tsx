import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { RecordTableRecordGroupBodyEffect } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupBodyEffect';
import { RecordTableRecordGroupJunctionDataChangedEffect } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupJunctionDataChangedEffect';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableRecordGroupBodyEffects = () => {
  const recordGroupIds = useAtomComponentStateValue(
    recordGroupIdsComponentState,
  );

  const isJunctionTable = isDefined(
    useContext(RecordTableWidgetContext)?.junctionCreateThrough,
  );

  return recordGroupIds.map((recordGroupId) => (
    <RecordGroupContext.Provider key={recordGroupId} value={{ recordGroupId }}>
      <RecordTableRecordGroupBodyEffect />
      {isJunctionTable && <RecordTableRecordGroupJunctionDataChangedEffect />}
    </RecordGroupContext.Provider>
  ));
};
