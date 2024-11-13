import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';
import { RecordTableBodyRecordGroupEffect } from '@/object-record/record-table/record-table-body/components/RecordTableBodyRecordGroupEffect';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordTableBodyRecordGroupEffects = () => {
  const recordGroupDefinitions = useRecoilComponentValueV2(
    recordGroupDefinitionsComponentState,
  );

  return recordGroupDefinitions.map((recordGroupDefinition) => (
    <RecordGroupContext.Provider
      value={{ recordGroupId: recordGroupDefinition.id }}
    >
      <RecordTableBodyRecordGroupEffect />
    </RecordGroupContext.Provider>
  ));
};
