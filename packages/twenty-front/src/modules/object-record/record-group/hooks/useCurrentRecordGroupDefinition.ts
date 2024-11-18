import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { hasRecordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/hasRecordGroupDefinitionsComponentSelector';
import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useContext, useMemo } from 'react';

export const useCurrentRecordGroupDefinition = (recordTableId?: string) => {
  const context = useContext(RecordGroupContext);

  const hasRecordGroups = useRecoilComponentValueV2(
    hasRecordGroupDefinitionsComponentSelector,
    recordTableId,
  );

  const recordGroupDefinitions = useRecoilComponentValueV2(
    recordGroupDefinitionsComponentState,
    recordTableId,
  );

  const recordGroupDefinition = useMemo(() => {
    if (!hasRecordGroups) {
      return undefined;
    }

    if (!context) {
      throw new Error(
        'useCurrentRecordGroupDefinition must be used within a RecordGroupContextProvider.',
      );
    }

    return recordGroupDefinitions.find(
      ({ id }) => id === context.recordGroupId,
    );
  }, [context, hasRecordGroups, recordGroupDefinitions]);

  return recordGroupDefinition;
};
