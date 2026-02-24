import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
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
  const fieldsWidgetGroupsDraftState = useRecoilComponentStateCallbackStateV2(
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
