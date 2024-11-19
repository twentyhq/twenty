import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';
import { RecordTableRecordGroupBodyEffect } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupBodyEffect';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordTableRecordGroupBodyEffects = () => {
  const recordGroupDefinitions = useRecoilComponentValueV2(
    recordGroupDefinitionsComponentState,
  );

  return recordGroupDefinitions.map((recordGroupDefinition) => (
    <RecordGroupContext.Provider
      value={{ recordGroupId: recordGroupDefinition.id }}
    >
      <RecordTableRecordGroupBodyEffect />
    </RecordGroupContext.Provider>
  ));
};
