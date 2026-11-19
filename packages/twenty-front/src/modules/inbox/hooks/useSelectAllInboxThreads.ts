import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { inboxListRecordSelectionInstanceIdState } from '@/inbox/states/inboxListRecordSelectionInstanceIdState';
import { recordIndexSelectableRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexSelectableRecordIdsComponentSelector';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { recordSelectionRangeComponentState } from '@/object-record/record-selection/states/recordSelectionRangeComponentState';

export const useSelectAllInboxThreads = () => {
  const store = useStore();

  const selectAllInboxThreads = useCallback(() => {
    const instanceId = store.get(inboxListRecordSelectionInstanceIdState.atom);

    if (!isDefined(instanceId)) {
      return;
    }

    const threadIds = store.get(
      recordIndexSelectableRecordIdsComponentSelector.selectorFamily({
        instanceId,
      }),
    );

    for (const threadId of threadIds) {
      store.set(
        isRecordSelectedComponentFamilyState.atomFamily({
          instanceId,
          familyKey: threadId,
        }),
        true,
      );
    }

    store.set(
      recordSelectionRangeComponentState.atomFamily({ instanceId }),
      null,
    );
  }, [store]);

  return { selectAllInboxThreads };
};
