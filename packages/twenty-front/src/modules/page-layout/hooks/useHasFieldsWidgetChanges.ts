import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetEditorModePersistedComponentState } from '@/page-layout/states/fieldsWidgetEditorModePersistedComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { fieldsWidgetUngroupedFieldsPersistedComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsPersistedComponentState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useHasFieldsWidgetChanges = () => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();

  const hasFieldsWidgetChanges = useCallback(
    (pageLayoutId: string): boolean => {
      const fieldsWidgetGroupsDraft = store.get(
        fieldsWidgetGroupsDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
      );
      const fieldsWidgetGroupsPersisted = store.get(
        fieldsWidgetGroupsPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
      );
      const fieldsWidgetUngroupedFieldsDraft = store.get(
        fieldsWidgetUngroupedFieldsDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
      );
      const fieldsWidgetUngroupedFieldsPersisted = store.get(
        fieldsWidgetUngroupedFieldsPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
      );
      const fieldsWidgetEditorModeDraft = store.get(
        fieldsWidgetEditorModeDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
      );
      const fieldsWidgetEditorModePersisted = store.get(
        fieldsWidgetEditorModePersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
      );

      return (
        !isDeeplyEqual(fieldsWidgetGroupsDraft, fieldsWidgetGroupsPersisted) ||
        !isDeeplyEqual(
          fieldsWidgetUngroupedFieldsDraft,
          fieldsWidgetUngroupedFieldsPersisted,
        ) ||
        !isDeeplyEqual(
          fieldsWidgetEditorModeDraft,
          fieldsWidgetEditorModePersisted,
        )
      );
    },
    [store, surfaceId],
  );

  return { hasFieldsWidgetChanges };
};
