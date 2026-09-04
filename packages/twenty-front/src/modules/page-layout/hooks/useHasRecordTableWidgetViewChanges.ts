import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { recordTableWidgetViewPersistedComponentState } from '@/page-layout/states/recordTableWidgetViewPersistedComponentState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useHasRecordTableWidgetViewChanges = () => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();

  const hasRecordTableWidgetViewChanges = useCallback(
    (pageLayoutId: string): boolean => {
      const recordTableWidgetViewDraft = store.get(
        recordTableWidgetViewDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
      );
      const recordTableWidgetViewPersisted = store.get(
        recordTableWidgetViewPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
      );

      return !isDeeplyEqual(
        recordTableWidgetViewDraft,
        recordTableWidgetViewPersisted,
      );
    },
    [store, surfaceId],
  );

  return { hasRecordTableWidgetViewChanges };
};
