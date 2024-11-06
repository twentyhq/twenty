import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';
import { recordGroupDefaultId } from '@/object-record/record-group/types/RecordGroupDefinition';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useMemo } from 'react';

export const useCurrentRecordGroupDefinition = (recordTableId?: string) => {
  const currentRecordGroupId = useCurrentRecordGroupId();

  const recordGroupDefinitions = useRecoilComponentValueV2(
    recordGroupDefinitionsComponentState,
    recordTableId,
  );

  const recordGroupDefinition = useMemo(() => {
    if (currentRecordGroupId === recordGroupDefaultId) {
      return undefined;
    }

    return recordGroupDefinitions.find(({ id }) => id === currentRecordGroupId);
  }, [currentRecordGroupId, recordGroupDefinitions]);

  return recordGroupDefinition;
};
