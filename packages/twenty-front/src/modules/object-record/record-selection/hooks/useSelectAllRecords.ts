import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { allRecordsSelectedStatusComponentSelector } from '@/object-record/record-selection/states/selectors/allRecordsSelectedStatusComponentSelector';
import { selectAllSelectableRecords } from '@/object-record/record-selection/utils/selectAllSelectableRecords';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';

export const useSelectAllRecords = (recordIndexId?: string) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordSelectionComponentInstanceContext,
    recordIndexId,
  );

  const allRecordsSelectedStatus = useAtomComponentSelectorCallbackState(
    allRecordsSelectedStatusComponentSelector,
    instanceId,
  );

  const { resetRecordSelection } = useResetRecordSelection(instanceId);

  const store = useStore();

  const selectAllRecords = useCallback(() => {
    if (store.get(allRecordsSelectedStatus) === 'all') {
      resetRecordSelection();
      return false;
    }

    selectAllSelectableRecords({ store, instanceId });

    return true;
  }, [allRecordsSelectedStatus, instanceId, resetRecordSelection, store]);

  return {
    selectAllRecords,
  };
};
