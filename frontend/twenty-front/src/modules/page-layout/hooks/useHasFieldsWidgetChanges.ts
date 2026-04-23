import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetEditorModePersistedComponentState } from '@/page-layout/states/fieldsWidgetEditorModePersistedComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { fieldsWidgetUngroupedFieldsPersistedComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsPersistedComponentState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useHasFieldsWidgetChanges = () => {
  const store = useStore();

  const hasFieldsWidgetChanges = useCallback(
    (pageLayoutId: string): boolean => {
      const fieldsWidgetGroupsDraft = store.get(
        fieldsWidgetGroupsDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );
      const fieldsWidgetGroupsPersisted = store.get(
        fieldsWidgetGroupsPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );
      const fieldsWidgetUngroupedFieldsDraft = store.get(
        fieldsWidgetUngroupedFieldsDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );
      const fieldsWidgetUngroupedFieldsPersisted = store.get(
        fieldsWidgetUngroupedFieldsPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );
      const fieldsWidgetEditorModeDraft = store.get(
        fieldsWidgetEditorModeDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );
      const fieldsWidgetEditorModePersisted = store.get(
        fieldsWidgetEditorModePersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
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
    [store],
  );

  return { hasFieldsWidgetChanges };
};
