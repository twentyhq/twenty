import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

type UseDeleteFieldsWidgetEditorGroupParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useDeleteFieldsWidgetEditorGroup = ({
  pageLayoutId,
  widgetId,
}: UseDeleteFieldsWidgetEditorGroupParams) => {
  const fieldsWidgetGroupsDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const deleteGroup = useCallback(
    (groupId: string) => {
      store.set(fieldsWidgetGroupsDraftState, (prev) => ({
        ...prev,
        [widgetId]: (prev[widgetId] ?? []).filter(
          (group) => group.id !== groupId,
        ),
      }));
    },
    [fieldsWidgetGroupsDraftState, widgetId, store],
  );

  return { deleteGroup };
};
