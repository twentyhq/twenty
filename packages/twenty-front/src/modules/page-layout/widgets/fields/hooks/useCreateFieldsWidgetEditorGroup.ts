import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { v4 } from 'uuid';

type UseCreateFieldsWidgetEditorGroupParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useCreateFieldsWidgetEditorGroup = ({
  pageLayoutId,
  widgetId,
}: UseCreateFieldsWidgetEditorGroupParams) => {
  const fieldsWidgetGroupsDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const createGroup = useCallback(
    (name: string) => {
      const allDraftGroups = store.get(fieldsWidgetGroupsDraftState);

      const currentGroups = allDraftGroups[widgetId] ?? [];
      const maxPosition = Math.max(...currentGroups.map((g) => g.position), -1);
      const newId = v4();

      store.set(fieldsWidgetGroupsDraftState, (prev) => ({
        ...prev,
        [widgetId]: [
          ...(prev[widgetId] ?? []),
          {
            id: newId,
            name,
            position: maxPosition + 1,
            isVisible: true,
            fields: [],
          },
        ],
      }));

      return newId;
    },
    [fieldsWidgetGroupsDraftState, widgetId, store],
  );

  return { createGroup };
};
