import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { inboxListRecordSelectionInstanceIdState } from '@/inbox/states/inboxListRecordSelectionInstanceIdState';
import { selectAllSelectableRecords } from '@/object-record/record-selection/utils/selectAllSelectableRecords';

export const useSelectAllInboxThreads = () => {
  const store = useStore();

  const selectAllInboxThreads = useCallback(() => {
    const instanceId = store.get(inboxListRecordSelectionInstanceIdState.atom);

    if (!isDefined(instanceId)) {
      return;
    }

    selectAllSelectableRecords({ store, instanceId });
  }, [store]);

  return { selectAllInboxThreads };
};
