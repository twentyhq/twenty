import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { recordTableWidgetViewPersistedComponentState } from '@/page-layout/states/recordTableWidgetViewPersistedComponentState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useHasRecordTableWidgetViewChanges = () => {
  const store = useStore();

  const hasRecordTableWidgetViewChanges = useCallback(
    (pageLayoutId: string): boolean => {
      const recordTableWidgetViewDraft = store.get(
        recordTableWidgetViewDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );
      const recordTableWidgetViewPersisted = store.get(
        recordTableWidgetViewPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );

      return !isDeeplyEqual(
        recordTableWidgetViewDraft,
        recordTableWidgetViewPersisted,
      );
    },
    [store],
  );

  return { hasRecordTableWidgetViewChanges };
};
