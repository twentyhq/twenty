import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useContext, useMemo } from 'react';

type UseCurrentRecordGroupProps = {
  recordTableId?: string;
};

export const useCurrentRecordGroup = ({
  recordTableId,
}: UseCurrentRecordGroupProps = {}) => {
  const context = useContext(RecordGroupContext);

  const recordGroupDefinitions = useRecoilComponentValueV2(
    recordGroupDefinitionsComponentState,
    recordTableId,
  );

  if (!context) {
    throw new Error(
      'useCurrentRecordGroup must be used within a RecordGroupContextProvider',
    );
  }

  if (!context.recordGroupId) {
    throw new Error('RecordGroupContext is malformed');
  }

  const recordGroup = useMemo(
    () =>
      recordGroupDefinitions.find(
        (recordGroup) => recordGroup.id === context.recordGroupId,
      ),
    [context.recordGroupId, recordGroupDefinitions],
  );

  if (!recordGroup) {
    throw new Error(
      `RecordGroup with id ${context.recordGroupId} not found in recordGroupDefinitions`,
    );
  }

  return recordGroup;
};
